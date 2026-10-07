<?php

namespace App\Http\Controllers;

use App\Models\AccessCode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RedeemController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('Redeem', [
            'code' => $request->query('code', ''),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:40'],
        ]);

        $code = Str::of($data['code'])->upper()->trim()->toString();

        $accessCode = AccessCode::with('book')->where('code', $code)->first();

        if (! $accessCode) {
            return back()->withErrors(['code' => 'This code is not valid. Please check it again.']);
        }

        if ($accessCode->isRedeemed()) {
            $already = $accessCode->redeemed_by === $request->user()->id;

            return back()->withErrors([
                'code' => $already
                    ? 'You have already redeemed this code. The book is already in your library.'
                    : 'This code has already been used.',
            ]);
        }

        $user = $request->user();
        $book = $accessCode->book;
        $expiresAt = now()->addMonths($accessCode->duration_months);

        // Grant / extend access.
        $user->books()->syncWithoutDetaching([
            $book->id => [
                'access_code_id' => $accessCode->id,
                'granted_at' => now(),
                'expires_at' => $expiresAt,
            ],
        ]);

        $accessCode->update([
            'redeemed_by' => $user->id,
            'redeemed_at' => now(),
        ]);

        return redirect()
            ->route('books.show', $book)
            ->with('success', "Access unlocked! \"{$book->title}\" has been added to your library for {$accessCode->duration_months} months.");
    }
}
