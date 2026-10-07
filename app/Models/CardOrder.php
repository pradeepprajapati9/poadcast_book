<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CardOrder extends Model
{
    protected $fillable = [
        'user_id', 'master_card_id', 'card_plan_id', 'months', 'amount',
        'kind', 'status', 'method', 'reference', 'paid_at', 'approved_by',
    ];

    protected $casts = ['paid_at' => 'datetime'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function card(): BelongsTo
    {
        return $this->belongsTo(MasterCard::class, 'master_card_id');
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(CardPlan::class, 'card_plan_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Confirm payment and put the months on the card.
     *
     * Guarded against running twice — approving an already-paid order would
     * hand out free months.
     */
    public function markPaid(?User $approver = null, ?string $method = null, ?string $reference = null): bool
    {
        if ($this->status === 'paid') {
            return false;
        }

        $card = $this->card;

        if (! $card) {
            return false;
        }

        $card->recharge($this->months, 'order', $reference ?: $this->reference ?: "order#{$this->id}");

        $this->update([
            'status' => 'paid',
            'method' => $method ?: $this->method ?: 'cash',
            'reference' => $reference ?: $this->reference,
            'paid_at' => now(),
            'approved_by' => $approver?->id,
        ]);

        return true;
    }
}
