<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class AccessCode extends Model
{
    protected $fillable = [
        'code', 'book_id', 'duration_months', 'redeemed_by', 'redeemed_at', 'batch',
    ];

    protected $casts = [
        'redeemed_at' => 'datetime',
    ];

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    public function redeemer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'redeemed_by');
    }

    public function isRedeemed(): bool
    {
        return ! is_null($this->redeemed_at);
    }

    /**
     * Generate a unique packet code like ALIN-3M9K-7Z2P-XQ1B.
     */
    public static function generateCode(string $prefix): string
    {
        $prefix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $prefix), 0, 4));
        $prefix = str_pad($prefix, 4, 'X');

        do {
            $code = $prefix . '-' . static::segment() . '-' . static::segment() . '-' . static::segment();
        } while (static::where('code', $code)->exists());

        return $code;
    }

    protected static function segment(): string
    {
        return strtoupper(Str::password(4, true, true, false, false));
    }
}
