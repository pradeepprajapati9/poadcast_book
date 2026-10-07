<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AccessCode;
use App\Models\Book;
use App\Models\Chapter;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $chapters = Chapter::count();
        $missingPdf = Chapter::whereNull('pdf_path')->count();
        $published = Book::where('is_published', true)->count();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'books' => Book::count(),
                'books_published' => $published,
                'books_draft' => Book::where('is_published', false)->count(),
                'chapters' => $chapters,
                'chapters_missing_pdf' => $missingPdf,
                'readers' => User::where('is_admin', false)->count(),
                // wherePivot() is not available inside whereHas(), so the pivot
                // column is qualified by table name instead.
                'readers_with_access' => User::whereHas(
                    'books',
                    fn ($q) => $q->where('book_user.expires_at', '>', now()),
                )->count(),
                'codes' => AccessCode::count(),
            ],

            // Everything here is a broken/incomplete state the admin can fix.
            'attention' => [
                'chapters_missing_pdf' => Chapter::with('book:id,title,slug')
                    ->whereNull('pdf_path')
                    ->orderBy('book_id')
                    ->orderBy('number')
                    ->take(6)
                    ->get()
                    ->map(fn (Chapter $c) => [
                        'id' => $c->id,
                        'label' => "{$c->book?->title} · Chapter {$c->number}",
                        'href' => $c->book
                            ? route('admin.books.chapters.edit', [$c->book->slug, $c->id])
                            : null,
                    ]),

                'books_without_chapters' => Book::doesntHave('chapters')
                    ->take(6)
                    ->get(['id', 'title', 'slug'])
                    ->map(fn (Book $b) => [
                        'id' => $b->id,
                        'label' => $b->title,
                        'href' => route('admin.books.chapters.index', $b->slug),
                    ]),

                'unpublished_books' => Book::where('is_published', false)
                    ->take(6)
                    ->get(['id', 'title', 'slug'])
                    ->map(fn (Book $b) => [
                        'id' => $b->id,
                        'label' => $b->title,
                        'href' => route('admin.books.edit', $b->slug),
                    ]),
            ],

            'recentBooks' => Book::withCount('chapters')
                ->latest()
                ->take(6)
                ->get()
                ->map(fn (Book $b) => [
                    'id' => $b->id,
                    'title' => $b->title,
                    'slug' => $b->slug,
                    'cover_image' => $b->cover_image,
                    'is_published' => $b->is_published,
                    'chapters_count' => $b->chapters_count,
                    'views' => $b->views,
                ]),
        ]);
    }
}
