<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chapters', function (Blueprint $table) {
            // Chapters are now uploaded as PDFs instead of authored as HTML.
            // Stored on the private disk and streamed through a gated route so
            // a locked chapter cannot be fetched by guessing its URL.
            $table->string('pdf_path')->nullable()->after('content');
            $table->unsignedInteger('pdf_pages')->nullable()->after('pdf_path');
        });
    }

    public function down(): void
    {
        Schema::table('chapters', function (Blueprint $table) {
            $table->dropColumn(['pdf_path', 'pdf_pages']);
        });
    }
};
