<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CardDevice extends Model
{
    protected $fillable = ['master_card_id', 'token', 'label', 'last_seen_at'];

    protected $casts = ['last_seen_at' => 'datetime'];

    public function card(): BelongsTo
    {
        return $this->belongsTo(MasterCard::class, 'master_card_id');
    }
}
