<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\EnsureDeviceToken::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
        ]);

        /*
         * Anything behind `auth` sends guests to the email OTP, not the
         * password form — that page is for admins only. Without this, hitting
         * a locked chapter asked readers for a password they never set.
         */
        $middleware->redirectGuestsTo(fn () => route('otp.create'));
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
