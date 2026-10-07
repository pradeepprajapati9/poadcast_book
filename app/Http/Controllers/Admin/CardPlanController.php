<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CardOrder;
use App\Models\CardPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CardPlanController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Cards/Plans', [
            'plans' => CardPlan::withCount(['orders as paid_orders_count' => fn ($q) => $q->where('status', 'paid')])
                ->orderBy('sort_order')
                ->orderBy('months')
                ->paginate(10)
                ->through(fn (CardPlan $p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'months' => $p->months,
                    'price' => $p->price,
                    'per_month' => $p->perMonth(),
                    'description' => $p->description,
                    'is_active' => $p->is_active,
                    'sold' => $p->paid_orders_count,
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        CardPlan::create($this->validated($request));

        return back()->with('success', 'Plan created.');
    }

    public function update(Request $request, CardPlan $plan): RedirectResponse
    {
        $plan->update($this->validated($request));

        return back()->with('success', 'Plan updated.');
    }

    public function destroy(CardPlan $plan): RedirectResponse
    {
        // Past orders point at the plan for their price history, so a plan that
        // has sold anything is switched off rather than removed.
        if ($plan->orders()->exists()) {
            $plan->update(['is_active' => false]);

            return back()->with('success', 'Plan has past orders, so it was deactivated instead of deleted.');
        }

        $plan->delete();

        return back()->with('success', 'Plan deleted.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'months' => ['required', 'integer', 'min:1', 'max:60'],
            'price' => ['required', 'integer', 'min:0', 'max:100000'],
            'description' => ['nullable', 'string', 'max:160'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);
    }

    /* ── Orders ────────────────────────────────────────────────────────── */

    public function orders(Request $request): Response
    {
        $status = $request->query('status', 'pending');

        $orders = CardOrder::query()
            ->with(['user:id,name,email', 'card:id,code,source', 'plan:id,name'])
            ->when(in_array($status, ['pending', 'paid', 'cancelled'], true), fn ($q) => $q->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (CardOrder $o) => [
                'id' => $o->id,
                'user' => $o->user?->name,
                'email' => $o->user?->email,
                'card' => $o->card?->code,
                'source' => $o->card?->source,
                'plan' => $o->plan?->name,
                'months' => $o->months,
                'amount' => $o->amount,
                'kind' => $o->kind,
                'status' => $o->status,
                'method' => $o->method,
                'reference' => $o->reference,
                'placed_on' => $o->created_at->format('M d, Y'),
                'paid_at' => $o->paid_at?->format('M d, Y'),
            ]);

        return Inertia::render('Admin/Cards/Orders', [
            'orders' => $orders,
            'filters' => ['status' => $status],
            'summary' => [
                'pending' => CardOrder::where('status', 'pending')->count(),
                'revenue' => CardOrder::where('status', 'paid')->sum('amount'),
            ],
        ]);
    }

    /**
     * Confirm a payment received offline (cash at the counter, or UPI) and put
     * the months on the card.
     */
    public function approveOrder(Request $request, CardOrder $order): RedirectResponse
    {
        $data = $request->validate([
            'method' => ['required', 'in:cash,upi,online'],
            'reference' => ['nullable', 'string', 'max:80'],
        ]);

        if (! $order->markPaid($request->user(), $data['method'], $data['reference'] ?? null)) {
            return back()->withErrors(['order' => 'This order is already settled or has no card attached.']);
        }

        return back()->with('success', "₹{$order->amount} confirmed · {$order->months} months added to {$order->card->code}.");
    }

    public function cancelOrder(CardOrder $order): RedirectResponse
    {
        if (! $order->isPending()) {
            return back()->withErrors(['order' => 'Only a pending order can be cancelled.']);
        }

        $order->update(['status' => 'cancelled']);

        return back()->with('success', 'Order cancelled.');
    }
}
