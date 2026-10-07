<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CardPlan extends Model
{
    protected $fillable = ['name', 'months', 'price', 'description', 'is_active', 'sort_order'];

    protected $casts = ['is_active' => 'boolean'];

    public function orders(): HasMany
    {
        return $this->hasMany(CardOrder::class);
    }

    /** ₹16/month — lets a reader compare plans at a glance. */
    public function perMonth(): int
    {
        return $this->months > 0 ? (int) round($this->price / $this->months) : $this->price;
    }
}
