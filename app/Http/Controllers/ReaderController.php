<?php

namespace App\Http\Controllers;

use App\Http\Middleware\EnsureDeviceToken;
use App\Models\Book;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReaderController extends Controller
{
    public function show(Request $request, Book $book, int $number): Response|RedirectResponse
    {
        abort_unless($book->is_published, 404);

        $chapter = $book->chapters()->where('number', $number)->firstOrFail();

        $user = $request->user();
        $hasAccess = $user ? $user->hasAccessTo($book) : false;

        // Gate: locked chapters require active access.
        if (! $chapter->is_free && ! $hasAccess) {
            return redirect()
                ->route('books.show', $book)
                ->with('locked', 'This chapter is locked. Please redeem an access code to unlock it.');
        }

        // A card opens every book, so it is also the easiest thing to share.
        // Access granted by a card is re-checked against the device limit.
        if (! $chapter->is_free && ! $this->deviceAllowed($request, $book)) {
            return redirect()
                ->route('card.show')
                ->with('locked', 'Your card is already in use on the maximum number of devices.');
        }

        $chapters = $book->chapters()->get(['id', 'number', 'title']);
        $index = $chapters->search(fn ($c) => $c->number === $chapter->number);
        $prev = $index > 0 ? $chapters[$index - 1] : null;
        $next = $index < $chapters->count() - 1 ? $chapters[$index + 1] : null;

        return Inertia::render('Reader', [
            'book' => [
                'title' => $book->title,
                'slug' => $book->slug,
            ],
            'chapter' => [
                'id' => $chapter->id,
                'number' => $chapter->number,
                'title' => $chapter->title,
                'content' => $chapter->content,
                'image' => $chapter->image,
                // The PDF itself is never exposed as a path — only this gated
                // URL, which re-checks access on every request.
                'pdf_url' => $chapter->pdf_path
                    ? route('reader.pdf', [$book->slug, $chapter->number])
                    : null,
                'pdf_pages' => $chapter->pdf_pages,
            ],
            'nav' => [
                'total' => $chapters->count(),
                'index' => $index + 1,
                'prev' => $prev ? ['number' => $prev->number] : null,
                'next' => $next ? ['number' => $next->number] : null,
            ],
        ]);
    }

    /**
     * True when this browser may use the reader.
     *
     * Only card-based access is limited; a reader who redeemed this book's own
     * code always passes. Guests reaching a free chapter also pass.
     */
    private function deviceAllowed(Request $request, Book $book): bool
    {
        $user = $request->user();

        if (! $user) {
            return true;
        }

        return $user->canReadOnDevice(
            $book,
            $request->cookie(EnsureDeviceToken::COOKIE),
            Str::limit($request->userAgent() ?? '', 60, ''),
        );
    }

    /**
     * Stream a chapter PDF inline.
     *
     * This runs the same lock check as show(): the file lives outside the
     * public directory, so this route is the only way to reach it and a locked
     * chapter cannot be pulled by guessing a storage path.
     */
    public function pdf(Request $request, Book $book, int $number): StreamedResponse
    {
        abort_unless($book->is_published, 404);

        $chapter = $book->chapters()->where('number', $number)->firstOrFail();

        $user = $request->user();
        $hasAccess = $user ? $user->hasAccessTo($book) : false;

        abort_if(! $chapter->is_free && ! $hasAccess, 403, 'This chapter is locked.');
        abort_if(
            ! $chapter->is_free && ! $this->deviceAllowed($request, $book),
            403,
            'Your card is already in use on the maximum number of devices.',
        );
        abort_unless($chapter->pdf_path && Storage::disk('local')->exists($chapter->pdf_path), 404);

        return Storage::disk('local')->response(
            $chapter->pdf_path,
            Str::slug("{$book->title}-chapter-{$chapter->number}") . '.pdf',
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline',
            ],
        );
    }
}
