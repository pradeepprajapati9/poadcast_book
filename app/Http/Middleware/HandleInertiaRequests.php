<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'email_verified_at' => $user->email_verified_at,
                    'is_admin' => (bool) $user->is_admin,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'locked' => fn () => $request->session()->get('locked'),
            ],
            'nav' => [
                'genres' => fn () => \Illuminate\Support\Facades\Cache::remember(
                    'nav.genres',
                    now()->addHour(),
                    fn () => \App\Models\Genre::orderBy('name')->get(['name', 'slug', 'icon']),
                ),
            ],
        ];
    }
}
