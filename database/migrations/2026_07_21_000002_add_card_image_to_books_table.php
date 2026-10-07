<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('books', function (Blueprint $table) {
            // Image for the book-page overview card. Separate from cover_image
            // (the library poster) so admins can use a wider/different artwork
            // there; falls back to the cover when not set.
            $table->string('card_image')->nullable()->after('cover_image');
        });
    }

    public function down(): void
    {
        Schema::table('books', fn (Blueprint $table) => $table->dropColumn('card_image'));
    }
};
