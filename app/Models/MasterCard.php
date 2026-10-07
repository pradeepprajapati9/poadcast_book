<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class MasterCard extends Model
{
    protected $fillable = [
        'code', 'user_id', 'claimed_at', 'expires_at', 'is_active', 'device_limit', 'batch', 'source',
    ];

    protected $casts = [
        'claimed_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function recharges(): HasMany
    {
        return $this->hasMany(CardRecharge::class);
    }

    public function devices(): HasMany
    {
        return $this->hasMany(CardDevice::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(CardOrder::class);
    }

    /** Days before expiry at which the reader is nudged to renew. */
    public const RENEW_WINDOW_DAYS = 10;

    public function needsRenewalSoon(): bool
    {
        return $this->isActive() && $this->daysLeft() <= self::RENEW_WINDOW_DAYS;
    }

    /** In date and not switched off by an admin. */
    public function isActive(): bool
    {
        return $this->is_active
            && $this->expires_at !== null
            && $this->expires_at->isFuture();
    }

    public function daysLeft(): int
    {
        return $this->isActive() ? now()->diffInDays($this->expires_at) : 0;
    }

    /**
     * Add months to the card.
     *
     * Time is added to whichever is later — now, or the current expiry — so
     * recharging early never burns the days already paid for.
     */
    public function recharge(int $months, string $source = 'voucher', ?string $reference = null): void
    {
        $from = $this->expires_at && $this->expires_at->isFuture()
            ? $this->expires_at
            : now();

        $this->expires_at = $from->copy()->addMonths($months);
        $this->save();

        $this->recharges()->create([
            'months' => $months,
            'source' => $source,
            'reference' => $reference,
            'expires_at_after' => $this->expires_at,
        ]);
    }

    /**
     * Register a device against the card, enforcing the sharing limit.
     *
     * A known device always passes. A new one is only allowed while there is
     * room; otherwise the caller shows "card is on too many devices" instead of
     * silently letting a shared code work everywhere.
     */
    public function registerDevice(string $token, ?string $label = null): bool
    {
        $device = $this->devices()->where('token', $token)->first();

        if ($device) {
            $device->update(['last_seen_at' => now()]);

            return true;
        }

        if ($this->devices()->count() >= $this->device_limit) {
            return false;
        }

        $this->devices()->create([
            'token' => $token,
            'label' => $label,
            'last_seen_at' => now(),
        ]);

        return true;
    }

    /** STORY-4F7K-9P2M — same shape as a packet code, different prefix. */
    public static function generateCode(): string
    {
        do {
            $code = 'SV-' . static::segment() . '-' . static::segment() . '-' . static::segment();
        } while (static::where('code', $code)->exists());

        return $code;
    }

    protected static function segment(): string
    {
        return strtoupper(Str::password(4, true, true, false, false));
    }
}
