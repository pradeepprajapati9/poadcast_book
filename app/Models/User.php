<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'is_admin',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
        ];
    }

    /**
     * Books this user has (or had) access to.
     */
    public function books(): BelongsToMany
    {
        return $this->belongsToMany(Book::class)
            ->withPivot(['access_code_id', 'granted_at', 'expires_at'])
            ->withTimestamps();
    }

    /**
     * The user's master card, if they have claimed one.
     */
    public function masterCard(): HasOne
    {
        return $this->hasOne(MasterCard::class);
    }

    public function cardOrders(): HasMany
    {
        return $this->hasMany(CardOrder::class);
    }

    /**
     * An in-date master card, or null.
     */
    public function activeCard(): ?MasterCard
    {
        $card = $this->relationLoaded('masterCard') ? $this->masterCard : $this->masterCard()->first();

        return $card && $card->isActive() ? $card : null;
    }

    /**
     * Does the user currently have active (non-expired) access to a book?
     *
     * Two routes in: a master card opens every book while it is in date, and a
     * redeemed per-book code opens just that one. Both models run side by side.
     */
    public function hasAccessTo(Book $book): bool
    {
        if ($this->activeCard()) {
            return true;
        }

        return $this->ownsBook($book);
    }

    /** Access earned by redeeming that book's own code. */
    public function ownsBook(Book $book): bool
    {
        return $this->books()
            ->where('books.id', $book->id)
            ->wherePivot('expires_at', '>', now())
            ->exists();
    }

    /**
     * Access to $book once the card's device limit is taken into account.
     *
     * A shared card code is the obvious way to abuse an all-you-can-read pass,
     * so card-based access is refused on an unrecognised device once the card
     * is already on its limit. Per-book access is unaffected — that is bought
     * one book at a time and not worth policing.
     */
    public function canReadOnDevice(Book $book, ?string $deviceToken, ?string $label = null): bool
    {
        if ($this->ownsBook($book)) {
            return true;
        }

        $card = $this->activeCard();

        if (! $card) {
            return false;
        }

        return $deviceToken !== null && $card->registerDevice($deviceToken, $label);
    }

    /**
     * Where this user lands after signing in. Admins go straight to the admin
     * panel; readers to their account. Kept here so every login path (password
     * and OTP) stays in agreement.
     */
    public function homeRoute(): string
    {
        return $this->is_admin
            ? route('admin.dashboard', absolute: false)
            : route('dashboard', absolute: false);
    }
}
