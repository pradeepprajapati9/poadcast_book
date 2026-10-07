<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Genre;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LibraryController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $genreSlug = $request->query('genre');

        $books = Book::query()
            ->where('is_published', true)
            ->withCount('chapters')
            ->with('genres')
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('author', 'like', "%{$search}%")
                        ->orWhere('subtitle', 'like', "%{$search}%");
                });
            })
            ->when($genreSlug, function ($q) use ($genreSlug) {
                $q->whereHas('genres', fn ($q) => $q->where('slug', $genreSlug));
            })
            ->latest()
            ->get()
            ->map->toCard();

        return Inertia::render('Library', [
            'books' => $books,
            'genres' => Genre::query()->orderBy('name')->get(['id', 'name', 'slug', 'icon']),
            'filters' => [
                'search' => $search,
                'genre' => $genreSlug,
            ],
        ]);
    }
}
