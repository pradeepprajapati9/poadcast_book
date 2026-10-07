<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Slide;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SlideController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Slides/Index', [
            'slides' => Slide::query()
                ->orderBy('sort_order')
                ->orderByDesc('id')
                ->paginate(10)
                ->withQueryString()
                ->through(fn (Slide $s) => [
                    'id' => $s->id,
                    'eyebrow' => $s->eyebrow,
                    'title' => $s->title,
                    'subtitle' => $s->subtitle,
                    'image' => $s->image,
                    'card_image' => $s->card_image,
                    'is_active' => $s->is_active,
                ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Slides/Form', [
            'slide' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $data['image'] = $this->handleUpload($request, 'image') ?? ($data['image_url'] ?? null);
        $data['card_image'] = $this->handleUpload($request, 'card_image') ?? ($data['card_image_url'] ?? null);
        Slide::create($this->fields($data));

        return redirect()->route('admin.slides.index')->with('success', 'Slide added successfully.');
    }

    public function edit(Slide $slide): Response
    {
        return Inertia::render('Admin/Slides/Form', [
            'slide' => $slide->only([
                'id', 'eyebrow', 'title', 'subtitle', 'image', 'card_image', 'is_active',
            ]),
        ]);
    }

    public function update(Request $request, Slide $slide): RedirectResponse
    {
        $data = $this->validated($request);
        $data['image'] = $this->handleUpload($request, 'image') ?? (($data['image_url'] ?? null) ?: $slide->image);
        $data['card_image'] = $this->handleUpload($request, 'card_image') ?? (($data['card_image_url'] ?? null) ?: $slide->card_image);
        $slide->update($this->fields($data));

        return redirect()->route('admin.slides.index')->with('success', 'Slide updated successfully.');
    }

    public function destroy(Slide $slide): RedirectResponse
    {
        $slide->delete();

        return redirect()->route('admin.slides.index')->with('success', 'Slide deleted successfully.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'eyebrow' => ['nullable', 'string', 'max:60'],
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'image' => ['nullable', 'image', 'max:6144'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'card_image' => ['nullable', 'image', 'max:6144'],
            'card_image_url' => ['nullable', 'string', 'max:2048'],
        ]);
    }

    private function fields(array $data): array
    {
        return collect($data)->only([
            'eyebrow', 'title', 'subtitle', 'image', 'card_image', 'is_active',
        ])->all();
    }

    private function handleUpload(Request $request, string $field): ?string
    {
        if (! $request->hasFile($field)) {
            return null;
        }

        $dir = public_path('uploads/slides');
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $file = $request->file($field);
        $name = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $file->move($dir, $name);

        return '/uploads/slides/' . $name;
    }
}
