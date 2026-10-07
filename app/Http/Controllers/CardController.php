<?php

namespace App\Http\Controllers;

use App\Http\Middleware\EnsureDeviceToken;
use App\Models\CardOrder;
use App\Models\CardPlan;
use App\Models\MasterCard;
use App\Models\RechargeVoucher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CardController extends Controller
{
    /**
     * The reader's card: status, days left, recharge history, devices.
     */
    public function show(Request $request): Response
    {
        $user = $request->user();
        $card = $user->masterCard()->with(['recharges' => fn ($q) => $q->latest()->take(10), 'devices'])->first();

        return Inertia::render('Card/Show', [
            'card' => $card ? $this->cardPayload($card, $request) : null,
            'plans' => CardPlan::where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('months')
                ->get()
                ->map(fn (CardPlan $p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'months' => $p->months,
                    'price' => $p->price,
                    'per_month' => $p->perMonth(),
                    'description' => $p->description,
                ]),
            'pendingOrder' => $user->cardOrders()
                ->where('status', 'pending')
                ->latest()
                ->first()
                ?->only(['id', 'months', 'amount', 'kind', 'created_at']),
            'payTo' => config('services.upi.id'),
            'razorpayEnabled' => RazorpayController::enabled(),
            // Drives the short "tell us who you are" step shown at checkout.
            'profile' => [
                'name' => $user->name,
                'phone' => $user->phone,
                'needs_name' => blank($user->name) || $user->name === Str::before($user->email, '@'),
                'needs_phone' => blank($user->phone),
            ],
        ]);
    }

    /**
     * Start a purchase: pick a plan, get an order to pay against.
     *
     * The card is created (or reused) right away but stays unrecharged — the
     * months only land once the payment is confirmed.
     */
    public function order(Request $request): RedirectResponse
    {
        $user = $request->user();

        /*
         * Signup asks for nothing but an email, so the profile is filled in
         * here instead — the one moment a reader is already committed. Fields
         * they have are not asked for again.
         */
        $needsName = blank($user->name) || $user->name === Str::before($user->email, '@');
        $needsPhone = blank($user->phone);

        $data = $request->validate([
            'plan' => ['required', 'exists:card_plans,id'],
            'name' => [$needsName ? 'required' : 'nullable', 'string', 'max:120'],
            'phone' => [$needsPhone ? 'required' : 'nullable', 'string', 'regex:/^[0-9+\- ]{8,20}$/'],
        ], [
            'name.required' => 'Please tell us your name.',
            'phone.required' => 'A phone number lets us reach you about your card.',
            'phone.regex' => 'Enter a valid phone number.',
        ]);

        $user->fill(array_filter([
            'name' => $data['name'] ?? null,
            'phone' => $data['phone'] ?? null,
        ]))->save();

        $plan = CardPlan::findOrFail($data['plan']);

        if (! $plan->is_active) {
            throw ValidationException::withMessages(['plan' => 'This plan is no longer available.']);
        }

        if ($user->cardOrders()->where('status', 'pending')->exists()) {
            throw ValidationException::withMessages([
                'plan' => 'You already have a payment awaiting confirmation.',
            ]);
        }

        $card = $user->masterCard;

        if (! $card) {
            $card = MasterCard::create([
                'code' => MasterCard::generateCode(),
                'user_id' => $user->id,
                'claimed_at' => now(),
                'source' => 'digital',
            ]);
        }

        $user->cardOrders()->create([
            'master_card_id' => $card->id,
            'card_plan_id' => $plan->id,
            'months' => $plan->months,
            'amount' => $plan->price,
            'kind' => $card->expires_at ? 'renewal' : 'new',
        ]);

        return redirect()->route('card.show')->with(
            'success',
            "Order placed for ₹{$plan->price}. Your card activates once the payment is confirmed.",
        );
    }

    public function cancelOrder(Request $request, CardOrder $order): RedirectResponse
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        if ($order->isPending()) {
            $order->update(['status' => 'cancelled']);
        }

        return back()->with('success', 'Order cancelled.');
    }

    /**
     * Link a physical card (or a code from the QR) to the signed-in account.
     */
    public function claim(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:40'],
        ]);

        $user = $request->user();

        if ($user->masterCard()->exists()) {
            throw ValidationException::withMessages([
                'code' => 'You already have a card linked to this account.',
            ]);
        }

        $card = MasterCard::whereRaw('UPPER(code) = ?', [strtoupper(trim($data['code']))])->first();

        if (! $card) {
            throw ValidationException::withMessages(['code' => 'This card number was not found.']);
        }

        if (! $card->is_active) {
            throw ValidationException::withMessages(['code' => 'This card has been deactivated.']);
        }

        if ($card->user_id && $card->user_id !== $user->id) {
            throw ValidationException::withMessages([
                'code' => 'This card is already linked to another account.',
            ]);
        }

        $card->update(['user_id' => $user->id, 'claimed_at' => now()]);

        return redirect()->route('card.show')->with('success', 'Card linked to your account.');
    }

    /**
     * Create a digital card for a reader who has no physical one.
     */
    public function createDigital(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->masterCard()->exists()) {
            return redirect()->route('card.show');
        }

        MasterCard::create([
            'code' => MasterCard::generateCode(),
            'user_id' => $user->id,
            'claimed_at' => now(),
            'source' => 'digital',
        ]);

        return redirect()->route('card.show')
            ->with('success', 'Digital card created. Recharge it to start reading.');
    }

    /**
     * Spend a recharge voucher on the reader's card.
     */
    public function recharge(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:40'],
        ]);

        $card = $request->user()->masterCard;

        if (! $card) {
            throw ValidationException::withMessages(['code' => 'Link a card first.']);
        }

        $voucher = RechargeVoucher::whereRaw('UPPER(code) = ?', [strtoupper(trim($data['code']))])->first();

        if (! $voucher) {
            throw ValidationException::withMessages(['code' => 'This recharge code was not found.']);
        }

        if ($voucher->isUsed()) {
            throw ValidationException::withMessages([
                'code' => $voucher->used_by_card_id === $card->id
                    ? 'You have already used this recharge code.'
                    : 'This recharge code has already been used.',
            ]);
        }

        $card->recharge($voucher->months, 'voucher', $voucher->code);

        $voucher->update(['used_by_card_id' => $card->id, 'used_at' => now()]);

        return redirect()->route('card.show')->with(
            'success',
            "{$voucher->months} month" . ($voucher->months > 1 ? 's' : '') .
            " added. Your card is valid until {$card->expires_at->format('M d, Y')}.",
        );
    }

    /**
     * Landing page for the QR printed on a physical card.
     */
    public function fromQr(Request $request, string $code): RedirectResponse|Response
    {
        if ($request->user()) {
            return redirect()->route('card.show')->with('card_code', $code);
        }

        // A physical card is bought over the counter, so the holder has no
        // account yet. Possession of the card is the credential: they land
        // here, give a name, and are signed straight in.
        return Inertia::render('Card/Activate', [
            'code' => strtoupper($code),
        ]);
    }

    /**
     * Sign in (or sign up) using a physical card's number.
     *
     * Name is optional and the profile can be completed later — the point is
     * to get a paying customer reading with the least friction.
     */
    /**
     * Start activation of a physical card.
     *
     * There is no separate signup: the reader gives an email, the usual OTP
     * proves it is theirs, and the card is attached once they are signed in.
     * That keeps one honest path in for everybody, card or no card.
     */
    public function activate(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:40'],
            'email' => ['required', 'email', 'max:255'],
        ]);

        $card = MasterCard::whereRaw('UPPER(code) = ?', [strtoupper(trim($data['code']))])->first();

        if (! $card) {
            throw ValidationException::withMessages(['code' => 'This card number was not found.']);
        }

        if (! $card->is_active) {
            throw ValidationException::withMessages(['code' => 'This card has been deactivated.']);
        }

        if ($card->user_id) {
            throw ValidationException::withMessages([
                'code' => 'This card is already linked to an account. Just sign in.',
            ]);
        }

        // Remembered across the OTP round trip, then consumed on verify.
        $request->session()->put('card_code', $card->code);

        return redirect()->route('otp.create')->with('prefill_email', strtolower(trim($data['email'])));
    }

    /**
     * Card status for the page, including whether this browser counts as one
     * of its allowed devices. The token itself is issued by EnsureDeviceToken.
     */
    private function cardPayload(MasterCard $card, Request $request): array
    {
        $token = $request->cookie(EnsureDeviceToken::COOKIE);

        $deviceAllowed = ! $card->isActive() || (
            $token !== null
            && $card->registerDevice($token, Str::limit($request->userAgent() ?? '', 60, ''))
        );

        return [
            'code' => $card->code,
            'active' => $card->isActive(),
            'expires_at' => $card->expires_at?->format('M d, Y'),
            'days_left' => $card->daysLeft(),
            'device_limit' => $card->device_limit,
            'device_count' => $card->devices()->count(),
            'device_allowed' => $deviceAllowed,
            'source' => $card->source,
            'needs_renewal' => $card->needsRenewalSoon(),
            'recharges' => $card->recharges->map(fn ($r) => [
                'id' => $r->id,
                'months' => $r->months,
                'source' => $r->source,
                'reference' => $r->reference,
                'on' => $r->created_at->format('M d, Y'),
                'valid_till' => $r->expires_at_after->format('M d, Y'),
            ]),
        ];
    }
}
