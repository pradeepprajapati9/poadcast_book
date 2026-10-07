<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class RechargeVoucher extends Model
{
    protected $fillable = ['code', 'months', 'used_by_card_id', 'used_at', 'batch'];

    protected $casts = ['used_at' => 'datetime'];

    public function card(): BelongsTo
    {
        return $this->belongsTo(MasterCard::class, 'used_by_card_id');
    }

    public function isUsed(): bool
    {
        return $this->used_at !== null;
    }

    /** RC-1M-4F7K-9P2M — the month count is readable on the printed slip. */
    public static function generateCode(int $months): string
    {
        do {
            $code = "RC-{$months}M-" . static::segment() . '-' . static::segment();
        } while (static::where('code', $code)->exists());

        return $code;
    }

    protected static function segment(): string
    {
        return strtoupper(Str::password(4, true, true, false, false));
    }
}
