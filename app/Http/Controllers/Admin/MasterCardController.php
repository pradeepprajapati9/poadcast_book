<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterCard;
use App\Models\RechargeVoucher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MasterCardController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status'); // active | expired | unclaimed

        $cards = MasterCard::query()
            ->with('user:id,name,email')
            ->withCount('devices')
            ->when($status === 'active', fn ($q) => $q->where('is_active', true)->where('expires_at', '>', now()))
            ->when($status === 'expired', fn ($q) => $q->where(fn ($w) => $w->whereNull('expires_at')->orWhere('expires_at', '<=', now())))
            ->when($status === 'unclaimed', fn ($q) => $q->whereNull('user_id'))
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (MasterCard $c) => [
                'id' => $c->id,
                'code' => $c->code,
                'holder' => $c->user?->name,
                'holder_email' => $c->user?->email,
                'active' => $c->isActive(),
                'expires_at' => $c->expires_at?->format('M d, Y'),
                'days_left' => $c->daysLeft(),
                'devices' => $c->devices_count,
                'device_limit' => $c->device_limit,
                'batch' => $c->batch,
                'source' => $c->source,
                'is_active' => $c->is_active,
            ]);

        return Inertia::render('Admin/Cards/Index', [
            'cards' => $cards,
            'filters' => ['status' => $status],
            'summary' => [
                'total' => MasterCard::count(),
                'active' => MasterCard::where('is_active', true)->where('expires_at', '>', now())->count(),
                'unclaimed' => MasterCard::whereNull('user_id')->count(),
            ],
        ]);
    }

    /**
     * Print run: a batch of blank cards to be handed out physically.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:500'],
            'device_limit' => ['required', 'integer', 'min:1', 'max:10'],
            'batch' => ['nullable', 'string', 'max:60'],
        ]);

        foreach (range(1, $data['quantity']) as $ignored) {
            MasterCard::create([
                'code' => MasterCard::generateCode(),
                'device_limit' => $data['device_limit'],
                'batch' => $data['batch'] ?: null,
                'source' => 'physical', // generated in bulk means printed stock
            ]);
        }

        return back()->with('success', "{$data['quantity']} cards generated.");
    }

    /**
     * Kill switch — used when a card is reported lost or is being abused.
     */
    public function toggle(MasterCard $card): RedirectResponse
    {
        $card->update(['is_active' => ! $card->is_active]);

        return back()->with('success', $card->is_active ? 'Card re-enabled.' : 'Card blocked.');
    }

    /**
     * Clear a card's devices so a genuine reader can move to a new phone.
     */
    public function resetDevices(MasterCard $card): RedirectResponse
    {
        $card->devices()->delete();

        return back()->with('success', 'Devices cleared for this card.');
    }

    public function destroy(MasterCard $card): RedirectResponse
    {
        if ($card->expires_at && $card->expires_at->isFuture()) {
            return back()->withErrors([
                'card' => 'This card has paid-for time left on it and cannot be deleted. Block it instead.',
            ]);
        }

        $card->delete();

        return back()->with('success', 'Card deleted.');
    }

    /* ── Recharge vouchers ─────────────────────────────────────────────── */

    public function vouchers(Request $request): Response
    {
        $status = $request->query('status'); // used | unused

        $vouchers = RechargeVoucher::query()
            ->with('card:id,code')
            ->when($status === 'used', fn ($q) => $q->whereNotNull('used_at'))
            ->when($status === 'unused', fn ($q) => $q->whereNull('used_at'))
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (RechargeVoucher $v) => [
                'id' => $v->id,
                'code' => $v->code,
                'months' => $v->months,
                'used' => $v->isUsed(),
                'used_by' => $v->card?->code,
                'used_at' => $v->used_at?->format('M d, Y'),
                'batch' => $v->batch,
            ]);

        return Inertia::render('Admin/Cards/Vouchers', [
            'vouchers' => $vouchers,
            'filters' => ['status' => $status],
            'summary' => [
                'total' => RechargeVoucher::count(),
                'used' => RechargeVoucher::whereNotNull('used_at')->count(),
            ],
        ]);
    }

    public function storeVouchers(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:500'],
            'months' => ['required', 'integer', 'min:1', 'max:24'],
            'batch' => ['nullable', 'string', 'max:60'],
        ]);

        foreach (range(1, $data['quantity']) as $ignored) {
            RechargeVoucher::create([
                'code' => RechargeVoucher::generateCode($data['months']),
                'months' => $data['months'],
                'batch' => $data['batch'] ?: null,
            ]);
        }

        return back()->with('success', "{$data['quantity']} recharge vouchers generated.");
    }

    public function destroyVoucher(RechargeVoucher $voucher): RedirectResponse
    {
        if ($voucher->isUsed()) {
            return back()->withErrors(['voucher' => 'A used voucher cannot be deleted.']);
        }

        $voucher->delete();

        return back()->with('success', 'Voucher deleted.');
    }
}
