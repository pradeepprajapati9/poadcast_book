<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CardRecharge extends Model
{
    protected $fillable = ['master_card_id', 'months', 'source', 'reference', 'expires_at_after'];

    protected $casts = ['expires_at_after' => 'datetime'];

    public function card(): BelongsTo
    {
        return $this->belongsTo(MasterCard::class, 'master_card_id');
    }
}
