<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search'));
        $filter = $request->query('filter'); // card | admin | readers

        $users = User::query()
            ->with('masterCard:id,user_id,expires_at,is_active')
            ->withCount(['books as active_books_count' => fn ($q) => $q->where('book_user.expires_at', '>', now())])
            ->when($search, fn ($q) => $q->where(fn ($w) => $w
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")))
            ->when($filter === 'card', fn ($q) => $q->whereHas('masterCard'))
            ->when($filter === 'admin', fn ($q) => $q->where('is_admin', true))
            ->when($filter === 'readers', fn ($q) => $q->where('is_admin', false))
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(function (User $u) {
                $card = $u->masterCard;
                $cardActive = $card && $card->is_active && $card->expires_at && $card->expires_at->isFuture();

                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'phone' => $u->phone,
                    'is_admin' => (bool) $u->is_admin,
                    'joined' => $u->created_at->format('M d, Y'),
                    'active_books' => $u->active_books_count,
                    'card' => $card ? [
                        'code' => $card->code,
                        'active' => $cardActive,
                        'expires_at' => $card->expires_at?->format('M d, Y'),
                    ] : null,
                ];
            });

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => ['search' => $search, 'filter' => $filter],
            'summary' => [
                'total' => User::count(),
                'readers' => User::where('is_admin', false)->count(),
                'with_card' => User::whereHas('masterCard')->count(),
            ],
        ]);
    }

    /**
     * Grant or revoke admin rights.
     *
     * Guards against removing the last admin, which would lock everyone out of
     * the panel, and against an admin dropping their own access by accident.
     */
    public function toggleAdmin(Request $request, User $user): RedirectResponse
    {
        if ($user->is_admin) {
            if ($user->id === $request->user()->id) {
                return back()->withErrors(['user' => 'You cannot remove your own admin access.']);
            }

            if (User::where('is_admin', true)->count() <= 1) {
                return back()->withErrors(['user' => 'At least one admin must remain.']);
            }
        }

        $user->update(['is_admin' => ! $user->is_admin]);

        return back()->with('success', $user->is_admin
            ? "{$user->name} is now an admin."
            : "{$user->name} is no longer an admin.");
    }
}
