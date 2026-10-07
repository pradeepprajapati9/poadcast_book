<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('books', function (Blueprint $table) {
            // Default thumbnail for this book's chapter rows. Chapters are bulk
            // uploaded as PDFs, so instead of setting a picture per chapter the
            // book carries one that every chapter falls back to.
            $table->string('chapter_image')->nullable()->after('cover_image');
        });
    }

    public function down(): void
    {
        Schema::table('books', fn (Blueprint $table) => $table->dropColumn('chapter_image'));
    }
};
