<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\MasterCard;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OtpLoginController extends Controller
{
    private const TTL = 600;          // OTP valid for 10 minutes
    private const RESEND_WAIT = 45;   // seconds between sends
    private const MAX_ATTEMPTS = 5;

    /** Step 1 — enter email */
    public function create(): Response
    {
        return Inertia::render('Auth/OtpRequest', [
            // Carried over when a reader started from a physical card.
            'prefillEmail' => session('prefill_email'),
            'linkingCard' => session('card_code'),
        ]);
    }

    /** Step 1 POST — generate + email OTP */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $email = Str::of($data['email'])->lower()->trim()->toString();

        // Throttle resends
        if (Cache::has($this->key('sent', $email))) {
            return back()->withErrors(['email' => 'Please wait a moment before requesting another OTP.']);
        }

        $code = (string) random_int(100000, 999999);

        Cache::put($this->key('otp', $email), Hash::make($code), self::TTL);
        Cache::put($this->key('sent', $email), true, self::RESEND_WAIT);
        Cache::forget($this->key('attempts', $email));

        $request->session()->put('otp_email', $email);

        try {
            Mail::to($email)->send(new OtpMail(
                code: $code,
                minutes: (int) (self::TTL / 60),
                cardCode: $request->session()->get('card_code'),
            ));
        } catch (\Throwable $e) {
            // Even if SMTP fails, the login flow can still continue.
            Log::warning('OTP email send failed: ' . $e->getMessage());
        }

        return redirect()->route('otp.verify')->with('status', 'A code has been sent to your email.');
    }

    /** Step 2 — enter OTP */
    public function showVerify(Request $request): Response|RedirectResponse
    {
        $email = $request->session()->get('otp_email');
        if (! $email) {
            return redirect()->route('otp.create');
        }

        return Inertia::render('Auth/OtpVerify', [
            'email' => $email,
            'status' => $request->session()->get('status'),
        ]);
    }

    /** Step 2 POST — verify + login */
    public function verify(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['required', 'digits:6'],
        ]);

        $email = $request->session()->get('otp_email');
        if (! $email) {
            return redirect()->route('otp.create');
        }

        $attempts = (int) Cache::get($this->key('attempts', $email), 0);
        if ($attempts >= self::MAX_ATTEMPTS) {
            Cache::forget($this->key('otp', $email));

            return redirect()->route('otp.create')->withErrors(['email' => 'Too many incorrect attempts. Please request a new OTP.']);
        }

        $hashed = Cache::get($this->key('otp', $email));
        if (! $hashed || ! Hash::check($data['code'], $hashed)) {
            Cache::put($this->key('attempts', $email), $attempts + 1, self::TTL);

            return back()->withErrors(['code' => 'The OTP is invalid or has expired.']);
        }

        // Success — clear OTP state
        Cache::forget($this->key('otp', $email));
        Cache::forget($this->key('attempts', $email));
        Cache::forget($this->key('sent', $email));

        // Existing reader login, or first-time auto-create
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => Str::of($email)->before('@')->headline(),
                'password' => Hash::make(Str::random(40)),
                'is_admin' => false,
                'email_verified_at' => now(),
            ],
        );

        if (! $user->email_verified_at) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        Auth::login($user, true);
        $request->session()->regenerate();
        $request->session()->forget('otp_email');

        // Someone who scanned a physical card and turned out to already have an
        // account is sent here; link that card now so the detour is invisible.
        if ($code = $request->session()->pull('card_code')) {
            $card = MasterCard::whereRaw('UPPER(code) = ?', [strtoupper($code)])->first();

            if ($card && $card->is_active && ! $card->user_id) {
                $card->update(['user_id' => $user->id, 'claimed_at' => now()]);

                return redirect()->route('card.show')->with('success', 'Card linked to your account.');
            }
        }

        return redirect()->intended($user->homeRoute());
    }

    private function key(string $type, string $email): string
    {
        return "otp:{$type}:" . sha1($email);
    }
}
