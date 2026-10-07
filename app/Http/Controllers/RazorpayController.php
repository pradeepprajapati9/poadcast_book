<?php

namespace App\Http\Controllers;

use App\Models\CardOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Razorpay\Api\Api;

class RazorpayController extends Controller
{
    public static function enabled(): bool
    {
        return filled(config('services.razorpay.key')) && filled(config('services.razorpay.secret'));
    }

    private function api(): Api
    {
        return new Api(config('services.razorpay.key'), config('services.razorpay.secret'));
    }

    /**
     * Create a Razorpay order for one of the reader's pending card orders.
     *
     * The CardOrder is the source of truth for what was bought; this just wraps
     * it in a gateway order and hands the checkout details back to the browser.
     */
    public function createOrder(Request $request, CardOrder $order): JsonResponse
    {
        abort_unless(self::enabled(), 404);
        abort_unless($order->user_id === $request->user()->id, 403);
        abort_unless($order->isPending(), 422, 'This order is no longer payable.');

        $rzpOrder = $this->api()->order->create([
            'amount' => $order->amount * 100, // paise
            'currency' => 'INR',
            'receipt' => "cardorder_{$order->id}",
            'notes' => ['card_order_id' => (string) $order->id],
        ]);

        // Remember the gateway order id so the callback can be tied back.
        $order->update(['reference' => $rzpOrder['id']]);

        return response()->json([
            'key' => config('services.razorpay.key'),
            'amount' => $order->amount * 100,
            'currency' => 'INR',
            'order_id' => $rzpOrder['id'],
            'name' => config('app.name'),
            'description' => "{$order->months} month card",
            'prefill' => [
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'contact' => $request->user()->phone,
            ],
        ]);
    }

    /**
     * Verify a completed payment and activate the card.
     *
     * The signature check is what makes this trustworthy — it proves the
     * success came from Razorpay and was not forged by the browser. Only then
     * is the order marked paid and the months added.
     */
    public function verify(Request $request): RedirectResponse
    {
        abort_unless(self::enabled(), 404);

        $data = $request->validate([
            'razorpay_order_id' => ['required', 'string'],
            'razorpay_payment_id' => ['required', 'string'],
            'razorpay_signature' => ['required', 'string'],
        ]);

        $order = CardOrder::where('reference', $data['razorpay_order_id'])
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $order) {
            return redirect()->route('card.show')->withErrors(['pay' => 'Order not found.']);
        }

        try {
            $this->api()->utility->verifyPaymentSignature([
                'razorpay_order_id' => $data['razorpay_order_id'],
                'razorpay_payment_id' => $data['razorpay_payment_id'],
                'razorpay_signature' => $data['razorpay_signature'],
            ]);
        } catch (\Throwable $e) {
            Log::warning('Razorpay signature verify failed: ' . $e->getMessage());

            return redirect()->route('card.show')->withErrors([
                'pay' => 'We could not verify the payment. If money was deducted, it will be refunded.',
            ]);
        }

        // markPaid() is idempotent, so a double callback never double-credits.
        $order->markPaid($request->user(), 'online', $data['razorpay_payment_id']);

        return redirect()->route('card.show')->with('success', 'Payment successful. Your card is active!');
    }
}
