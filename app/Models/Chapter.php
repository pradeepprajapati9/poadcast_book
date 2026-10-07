<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Chapter extends Model
{
    protected $fillable = [
        'book_id', 'number', 'title', 'content', 'image', 'is_free', 'published_at',
        'pdf_path', 'pdf_pages',
    ];

    protected $casts = [
        'is_free' => 'boolean',
        'published_at' => 'date',
    ];

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }
}
