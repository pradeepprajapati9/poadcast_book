<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $books = $user->books()
            ->withCount('chapters')
            ->orderByPivot('expires_at', 'desc')
            ->get()
            ->map(function ($book) {
                $expiresAt = $book->pivot->expires_at ? \Illuminate\Support\Carbon::parse($book->pivot->expires_at) : null;
                $active = $expiresAt && $expiresAt->isFuture();

                return array_merge($book->toCard(), [
                    'expires_at' => $expiresAt?->format('M d, Y'),
                    'days_left' => $active ? (int) ceil(now()->floatDiffInDays($expiresAt)) : 0,
                    'active' => $active,
                ]);
            });

        return Inertia::render('Dashboard', [
            'library' => $books,
        ]);
    }
}
