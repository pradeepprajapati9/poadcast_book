<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Give every browser a stable device token.
 *
 * Master-card access is capped to a few devices, and that check needs an id for
 * the current browser. Issuing it here — rather than on the card page alone —
 * means a reader who goes straight from the library to a chapter already has
 * one, instead of being turned away for having no token.
 */
class EnsureDeviceToken
{
    public const COOKIE = 'sv_device';

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->cookie(self::COOKIE);

        if (! $token) {
            $token = (string) Str::uuid();

            // Make it readable within this same request, not just the next one.
            $request->cookies->set(self::COOKIE, $token);

            return tap($next($request), function (Response $response) use ($token) {
                $response->headers->setCookie(
                    cookie()->forever(self::COOKIE, $token, httpOnly: true),
                );
            });
        }

        return $next($request);
    }
}
