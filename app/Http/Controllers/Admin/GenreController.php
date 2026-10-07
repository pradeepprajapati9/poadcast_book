<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Genre;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GenreController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Genres/Index', [
            'genres' => Genre::withCount('books')
                ->orderBy('name')
                ->paginate(10, ['id', 'name', 'slug', 'icon'])
                ->withQueryString(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'icon' => ['nullable', 'string', 'max:16'],
        ]);
        $data['slug'] = Str::slug($data['name']);

        Genre::updateOrCreate(['slug' => $data['slug']], $data);

        return back()->with('success', 'Genre saved successfully.');
    }

    public function update(Request $request, Genre $genre): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'icon' => ['nullable', 'string', 'max:16'],
        ]);
        $data['slug'] = Str::slug($data['name']);

        $genre->update($data);

        return back()->with('success', 'Genre updated successfully.');
    }

    public function destroy(Genre $genre): RedirectResponse
    {
        $genre->delete();

        return back()->with('success', 'Genre deleted successfully.');
    }
}
