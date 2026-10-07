<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AccessCode;
use App\Models\Book;
use App\Models\Genre;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BookController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Books/Index', [
            'books' => Book::query()
                ->withCount(['chapters', 'accessCodes'])
                ->latest()
                ->paginate(10)
                ->withQueryString()
                ->through(fn (Book $b) => [
                    'id' => $b->id,
                    'title' => $b->title,
                    'slug' => $b->slug,
                    'author' => $b->author,
                    'status' => $b->status,
                    'is_published' => $b->is_published,
                    'is_featured' => $b->is_featured,
                    'views' => $b->views,
                    'chapters_count' => $b->chapters_count,
                    'access_codes_count' => $b->access_codes_count,
                    'cover_image' => $b->cover_image,
                ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Books/Form', [
            'book' => null,
            'genres' => Genre::orderBy('name')->get(['id', 'name']),
            'selectedGenres' => [],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $data['slug'] = $this->uniqueSlug($data['title']);
        $data['cover_image'] = $this->handleUpload($request, 'cover_image');
        $data['card_image'] = $this->handleUpload($request, 'card_image');
        $data['chapter_image'] = $this->handleUpload($request, 'chapter_image');
        $data['banner_image'] = $this->handleUpload($request, 'banner_image') ?? $data['banner_image_url'] ?? null;

        $genres = $data['genres'] ?? [];
        $book = Book::create($this->onlyBookFields($data));
        $book->genres()->sync($genres);

        $added = $this->storeChapterPdfs($request, $book);
        $this->createAccessCode($book);

        return redirect()->route('admin.books.index')->with(
            'success',
            $added
                ? "Book created with {$added} chapter" . ($added > 1 ? 's' : '') . ' and its access code.'
                : 'Book created with its access code.',
        );
    }

    public function edit(Book $book): Response
    {
        return Inertia::render('Admin/Books/Form', [
            'book' => array_merge(
                $book->only([
                    'id', 'title', 'slug', 'subtitle', 'author', 'description',
                    'cover_image', 'card_image', 'chapter_image', 'banner_image', 'status', 'rating', 'price',
                    'access_months', 'is_featured', 'is_published',
                ]),
                [
                    'chapters_count' => $book->chapters()->count(),
                    'access_code' => $book->accessCode?->code,
                ],
            ),
            'genres' => Genre::orderBy('name')->get(['id', 'name']),
            'selectedGenres' => $book->genres()->pluck('genres.id'),
        ]);
    }

    public function update(Request $request, Book $book): RedirectResponse
    {
        $data = $this->validated($request, $book->id);
        $data['cover_image'] = $this->handleUpload($request, 'cover_image') ?? $book->cover_image;
        $data['card_image'] = $this->handleUpload($request, 'card_image') ?? $book->card_image;
        $data['chapter_image'] = $this->handleUpload($request, 'chapter_image') ?? $book->chapter_image;
        $data['banner_image'] = $this->handleUpload($request, 'banner_image') ?? ($data['banner_image_url'] ?? $book->banner_image);

        $genres = $data['genres'] ?? [];
        $book->update($this->onlyBookFields($data));
        $book->genres()->sync($genres);

        $added = $this->storeChapterPdfs($request, $book);
        // Deliberately not touching the access code — an edit must never change
        // a code that is already printed on packets.

        return redirect()->route('admin.books.index')->with(
            'success',
            $added
                ? "Book updated · {$added} chapter" . ($added > 1 ? 's' : '') . ' added.'
                : 'Book updated successfully.',
        );
    }

    public function destroy(Book $book): RedirectResponse
    {
        // Chapters and the access code cascade at the database level, but the
        // uploaded PDFs live on disk and would be left behind.
        $book->deleteWithFiles();

        return redirect()->route('admin.books.index')->with('success', 'Book deleted successfully.');
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'author' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['ongoing', 'completed'])],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'price' => ['nullable', 'integer', 'min:0'],
            'access_months' => ['nullable', 'integer', 'min:1', 'max:60'],
            'is_featured' => ['boolean'],
            'is_published' => ['boolean'],
            'genres' => ['array'],
            'genres.*' => ['integer', 'exists:genres,id'],
            'cover_image' => ['nullable', 'image', 'max:4096'],
            'card_image' => ['nullable', 'image', 'max:4096'],
            'chapter_image' => ['nullable', 'image', 'max:4096'],
            'banner_image' => ['nullable', 'image', 'max:6144'],
            'banner_image_url' => ['nullable', 'string', 'max:2048'],
            // Any number of chapter PDFs can be attached in one go.
            'chapter_pdfs' => ['nullable', 'array'],
            'chapter_pdfs.*' => ['file', 'mimes:pdf', 'max:51200'],
        ]);
    }

    private function onlyBookFields(array $data): array
    {
        return collect($data)->only([
            'title', 'slug', 'subtitle', 'author', 'description',
            'cover_image', 'card_image', 'chapter_image', 'banner_image', 'status', 'rating', 'price',
            'access_months', 'is_featured', 'is_published',
        ])->all();
    }

    /**
     * Turn each uploaded PDF into a chapter, appended after the existing ones.
     *
     * The order submitted by the form is preserved — the admin arranges the
     * queue there (and can reorder it), so re-sorting here would silently
     * override that choice. The chapter title comes from the filename, and the
     * very first chapter of a brand-new book is marked free so the book always
     * has a preview.
     *
     * @return int number of chapters created
     */
    private function storeChapterPdfs(Request $request, Book $book): int
    {
        $files = $request->file('chapter_pdfs');

        if (empty($files)) {
            return 0;
        }

        $files = collect($files)->filter()->values();

        $number = (int) $book->chapters()->max('number');
        $created = 0;

        foreach ($files as $file) {
            $number++;
            $path = $file->store('chapters', 'local');

            $book->chapters()->create([
                'number' => $number,
                'title' => $this->titleFromFilename($file->getClientOriginalName(), $number),
                'pdf_path' => $path,
                'pdf_pages' => $this->countPdfPages(Storage::disk('local')->path($path)),
                // Book-level chapter thumbnail; a per-chapter edit can override it.
                'image' => $book->chapter_image,
                'is_free' => $number === 1,
                'published_at' => now(),
            ]);

            $created++;
        }

        return $created;
    }

    /**
     * Give the book its single access code.
     *
     * One book = one code, enforced by a unique index on access_codes.book_id.
     * Editing a book never regenerates it: the code is printed on packets and
     * may already be in a reader's hands, so it has to stay stable.
     */
    private function createAccessCode(Book $book): void
    {
        if ($book->accessCodes()->exists()) {
            return;
        }

        $book->accessCodes()->create([
            'code' => AccessCode::generateCode(Str::of($book->title)->explode(' ')->first()),
            'duration_months' => $book->access_months ?: 3,
        ]);
    }

    /** "01 - The Boy Who Died.pdf" -> "The Boy Who Died" */
    private function titleFromFilename(string $filename, int $fallbackNumber): string
    {
        $name = pathinfo($filename, PATHINFO_FILENAME);
        $name = preg_replace('/[_-]+/', ' ', $name);
        // Strip a leading "01", "1.", "Chapter 3 -" style prefix.
        $name = preg_replace('/^\s*(chapter\s*)?\d+\s*[.\-:)]*\s*/i', '', (string) $name);
        $name = trim(preg_replace('/\s+/', ' ', (string) $name));

        return $name !== '' ? Str::limit($name, 200, '') : "Chapter {$fallbackNumber}";
    }

    /**
     * Page count read from the PDF structure — no extra dependency.
     * Null when the file is compressed in a way we cannot parse.
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

    private function uniqueSlug(string $title): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i = 1;
        while (Book::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }

        return $slug;
    }

    private function handleUpload(Request $request, string $field): ?string
    {
        if (! $request->hasFile($field)) {
            return null;
        }

        $dir = public_path('uploads/books');
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $file = $request->file($field);
        $name = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $file->move($dir, $name);

        return '/uploads/books/' . $name;
    }
}
