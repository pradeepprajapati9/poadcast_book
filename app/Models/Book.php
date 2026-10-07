<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Storage;

class Book extends Model
{
    protected $fillable = [
        'title', 'slug', 'subtitle', 'author', 'tagline', 'description',
        'cover_image', 'card_image', 'chapter_image', 'banner_image', 'status', 'rating', 'views',
        'price', 'access_months', 'is_featured', 'is_published',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'is_published' => 'boolean',
        'rating' => 'float',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function chapters(): HasMany
    {
        return $this->hasMany(Chapter::class)->orderBy('number');
    }

    public function genres(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class);
    }

    public function accessCodes(): HasMany
    {
        return $this->hasMany(AccessCode::class);
    }

    /**
     * The book's single access code (one book = one code).
     */
    public function accessCode(): HasOne
    {
        return $this->hasOne(AccessCode::class);
    }

    /**
     * Delete the book along with the chapter PDFs it owns.
     *
     * Chapters and the access code are removed by the database cascade, but
     * the PDFs sit on the private disk and would otherwise be orphaned.
     */
    public function deleteWithFiles(): void
    {
        foreach ($this->chapters()->whereNotNull('pdf_path')->pluck('pdf_path') as $path) {
            Storage::disk('local')->delete($path);
        }

        $this->delete();
    }

    public function readers(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot(['access_code_id', 'granted_at', 'expires_at'])
            ->withTimestamps();
    }

    /**
     * Lightweight payload used for book cards on the frontend.
     */
    public function toCard(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'subtitle' => $this->subtitle,
            'author' => $this->author,
            'tagline' => $this->tagline,
            'cover_image' => $this->cover_image,
            'banner_image' => $this->banner_image,
            'rating' => $this->rating,
            'status' => $this->status,
            'price' => $this->price,
            'chapters_count' => $this->chapters_count,
            'genres' => $this->relationLoaded('genres')
                ? $this->genres->take(2)->map(fn ($g) => ['name' => $g->name, 'slug' => $g->slug])->values()
                : [],
        ];
    }
}
