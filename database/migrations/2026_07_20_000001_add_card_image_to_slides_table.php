<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('slides', function (Blueprint $table) {
            // Side-card artwork. Previously this was borrowed from the linked
            // book's cover; slides no longer link to a book, so it is set here.
            $table->string('card_image')->nullable()->after('image');
        });
    }

    public function down(): void
    {
        Schema::table('slides', function (Blueprint $table) {
            $table->dropColumn('card_image');
        });
    }
};
