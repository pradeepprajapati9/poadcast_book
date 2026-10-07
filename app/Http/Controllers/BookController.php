<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookController extends Controller
{
    public function show(Request $request, Book $book): Response
    {
        abort_unless($book->is_published, 404);

        $book->increment('views');
        $book->load('genres');

        $user = $request->user();
        $hasAccess = $user ? $user->hasAccessTo($book) : false;

        // Display-only estimates. Chapters are PDFs now, so page counts come
        // straight from the file; the word-count path stays for any older
        // text chapter that has not been replaced yet.
        $wpm = 200;
        $wordsPerPage = 250;
        $minutesPerPdfPage = 2;

        $rawChapters = $book->chapters()->get();
        $totalPages = 0;

        $chapters = $rawChapters->map(function ($c) use ($book, $hasAccess, $wpm, $wordsPerPage, $minutesPerPdfPage, &$totalPages) {
            if ($c->pdf_path) {
                $pages = (int) $c->pdf_pages;
                $minutes = $pages * $minutesPerPdfPage;
            } else {
                $words = $this->countWords((string) $c->content);
                $pages = (int) ceil($words / $wordsPerPage);
                $minutes = (int) ceil($words / $wpm);
            }

            $totalPages += $pages;

            return [
                'id' => $c->id,
                'number' => $c->number,
                'title' => $c->title,
                // Per-chapter image, else the book's default chapter thumbnail.
                'image' => $c->image ?: $book->chapter_image,
                'is_free' => $c->is_free,
                'read_minutes' => $minutes,
                'published_at' => optional($c->published_at)->format('M d, Y'),
                'locked' => ! $c->is_free && ! $hasAccess,
            ];
        });

        // Books sharing at least one genre, most viewed first.
        $genreIds = $book->genres->pluck('id');
        $related = Book::query()
            ->where('is_published', true)
            ->where('id', '!=', $book->id)
            ->when($genreIds->isNotEmpty(), fn ($q) => $q->whereHas(
                'genres',
                fn ($g) => $g->whereIn('genres.id', $genreIds)
            ))
            ->orderByDesc('views')
            ->take(6)
            ->get()
            ->map(fn ($b) => [
                'id' => $b->id,
                'title' => $b->title,
                'slug' => $b->slug,
                'author' => $b->author,
                'cover_image' => $b->cover_image,
            ]);

        return Inertia::render('Books/Show', [
            'book' => [
                'id' => $book->id,
                'title' => $book->title,
                'slug' => $book->slug,
                'subtitle' => $book->subtitle,
                'author' => $book->author,
                'tagline' => $book->tagline,
                'description' => $book->description,
                'cover_image' => $book->cover_image,
                'card_image' => $book->card_image ?: $book->cover_image,
                'banner_image' => $book->banner_image,
                'status' => $book->status,
                'rating' => $book->rating,
                'views' => $book->views,
                'price' => $book->price,
                'access_months' => $book->access_months,
                'genres' => $book->genres->map(fn ($g) => ['name' => $g->name, 'slug' => $g->slug]),
                'total_pages' => $totalPages,
            ],
            'chapters' => $chapters,
            'related' => $related,
            'hasAccess' => $hasAccess,
        ]);
    }

    /**
     * Count words in chapter HTML.
     *
     * str_word_count() is ASCII-only and returns 0 for Devanagari, which would
     * show every Hindi chapter as "0 min read". Matching Unicode letter/number
     * runs instead keeps the estimate working in every language.
     */
    private function countWords(string $html): int
    {
        $text = strip_tags($html);

        return preg_match_all('/[\p{L}\p{N}]+/u', $text) ?: 0;
    }
}
