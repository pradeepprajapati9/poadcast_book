<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Genre;
use App\Models\Slide;
use App\Models\Testimonial;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Home', [
            'slides' => $this->heroSlides(),
            'featured' => Book::query()
                ->where('is_published', true)
                ->where('is_featured', true)
                ->withCount('chapters')
                ->with('genres')
                ->latest()
                ->take(8)
                ->get()
                ->map->toCard(),
            'latest' => Book::query()
                ->where('is_published', true)
                ->withCount('chapters')
                ->with('genres')
                ->latest()
                ->take(8)
                ->get()
                ->map->toCard(),
            'genres' => Genre::query()->orderBy('name')->get(['id', 'name', 'slug', 'icon']),
            'testimonials' => Testimonial::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(['name', 'role', 'body', 'stars']),
        ]);
    }

    /**
     * Admin-managed hero slides (normalized). If empty, the home page falls back to featured books.
     */
    private function heroSlides(): \Illuminate\Support\Collection
    {
        return Slide::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Slide $s) => [
                'id' => 's' . $s->id,
                'eyebrow' => $s->eyebrow,
                'title' => $s->title,
                'subtitle' => $s->subtitle,
                'bg' => $s->image,
                'cover' => $s->card_image ?: $s->image,
                'coverTitle' => $s->title,
                // Slides are no longer tied to a book, so every CTA lands on
                // the library rather than a per-slide destination.
                'href' => route('library'),
                'ctaLabel' => 'Start Reading',
            ]);
    }
}
