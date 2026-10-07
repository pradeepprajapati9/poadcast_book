<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Chapter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ChapterController extends Controller
{
    public function index(Book $book): Response
    {
        return Inertia::render('Admin/Chapters/Index', [
            'book' => $book->only(['id', 'title', 'slug']),
            'chapters' => $book->chapters()
                ->paginate(10)
                ->withQueryString()
                ->through(fn (Chapter $c) => [
                    'id' => $c->id,
                    'number' => $c->number,
                    'title' => $c->title,
                    'is_free' => $c->is_free,
                    'has_pdf' => (bool) $c->pdf_path,
                    'pdf_pages' => $c->pdf_pages,
                    'published_at' => optional($c->published_at)->format('Y-m-d'),
                ]),
        ]);
    }

    public function create(Book $book): Response
    {
        return Inertia::render('Admin/Chapters/Form', [
            'book' => $book->only(['id', 'title', 'slug']),
            'chapter' => null,
            'nextNumber' => (int) ($book->chapters()->max('number') + 1),
        ]);
    }

    public function store(Request $request, Book $book): RedirectResponse
    {
        $data = $this->validated($request, $book);
        $data['image'] = $this->handleUpload($request) ?? $data['image_url'] ?? null;
        $data = array_merge($data, $this->handlePdf($request));

        $book->chapters()->create($this->fields($data));

        return redirect()->route('admin.books.chapters.index', $book)->with('success', 'Chapter added successfully.');
    }

    public function edit(Book $book, Chapter $chapter): Response
    {
        abort_unless($chapter->book_id === $book->id, 404);

        return Inertia::render('Admin/Chapters/Form', [
            'book' => $book->only(['id', 'title', 'slug']),
            'chapter' => array_merge(
                $chapter->only(['id', 'number', 'title', 'image', 'is_free', 'published_at', 'pdf_pages']),
                ['has_pdf' => (bool) $chapter->pdf_path],
            ),
            'nextNumber' => $chapter->number,
        ]);
    }

    public function update(Request $request, Book $book, Chapter $chapter): RedirectResponse
    {
        abort_unless($chapter->book_id === $book->id, 404);

        $data = $this->validated($request, $book, $chapter->id);
        $data['image'] = $this->handleUpload($request) ?? $data['image_url'] ?? $chapter->image;
        $data = array_merge($data, $this->handlePdf($request, $chapter));

        $chapter->update($this->fields($data));

        return redirect()->route('admin.books.chapters.index', $book)->with('success', 'Chapter updated successfully.');
    }

    public function destroy(Book $book, Chapter $chapter): RedirectResponse
    {
        abort_unless($chapter->book_id === $book->id, 404);

        // Drop the stored PDF too, otherwise deleted chapters leave files behind.
        if ($chapter->pdf_path) {
            Storage::disk('local')->delete($chapter->pdf_path);
        }

        $chapter->delete();

        return redirect()->route('admin.books.chapters.index', $book)->with('success', 'Chapter deleted successfully.');
    }

    private function validated(Request $request, Book $book, ?int $ignoreId = null): array
    {
        return $request->validate([
            'number' => [
                'required', 'integer', 'min:1',
                \Illuminate\Validation\Rule::unique('chapters', 'number')
                    ->where('book_id', $book->id)
                    ->ignore($ignoreId),
            ],
            'title' => ['required', 'string', 'max:255'],
            'is_free' => ['boolean'],
            'published_at' => ['nullable', 'date'],
            'image' => ['nullable', 'image', 'max:6144'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            // 50 MB ceiling; `mimes:pdf` checks the real file type, not the
            // extension, so a renamed .exe is rejected.
            'pdf' => ['nullable', 'file', 'mimes:pdf', 'max:51200'],
        ]);
    }

    private function fields(array $data): array
    {
        return collect($data)
            ->only(['number', 'title', 'image', 'is_free', 'published_at', 'pdf_path', 'pdf_pages'])
            ->all();
    }

    /**
     * Store the PDF on the private disk (never public/) and return its path.
     *
     * Chapters are paid content, so the file must not be reachable by URL —
     * it is streamed later through a route that checks access.
     */
    private function handlePdf(Request $request, ?Chapter $chapter = null): array
    {
        if (! $request->hasFile('pdf')) {
            return [];
        }

        // Replace the old file rather than leaving orphans behind.
        if ($chapter?->pdf_path) {
            Storage::disk('local')->delete($chapter->pdf_path);
        }

        $path = $request->file('pdf')->store('chapters', 'local');

        return [
            'pdf_path' => $path,
            'pdf_pages' => $this->countPdfPages(Storage::disk('local')->path($path)),
        ];
    }

    /**
     * Page count read straight from the PDF structure — no extra dependency.
     * Returns null when the file is compressed in a way we cannot read, in
     * which case the UI simply omits the page count.
     */
    private function countPdfPages(string $absolutePath): ?int
    {
        $raw = @file_get_contents($absolutePath);
        if ($raw === false) {
            return null;
        }

        if (preg_match('/\/Type\s*\/Page[^s]/', $raw)) {
            return preg_match_all('/\/Type\s*\/Page[^s]/', $raw) ?: null;
        }

        if (preg_match('/\/Count\s+(\d+)/', $raw, $m)) {
            return (int) $m[1] ?: null;
        }

        return null;
    }

    private function handleUpload(Request $request): ?string
    {
        if (! $request->hasFile('image')) {
            return null;
        }

        $dir = public_path('uploads/chapters');
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $file = $request->file('image');
        $name = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $file->move($dir, $name);

        return '/uploads/chapters/' . $name;
    }
}
