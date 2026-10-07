<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('slides', function (Blueprint $table) {
            $table->id();
            $table->string('eyebrow')->default('Featured Story');
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->string('tagline')->nullable();
            $table->string('image')->nullable();          // background image
            $table->string('cta_label')->default('Start Reading');
            $table->string('cta_url')->nullable();         // custom link (if no book_id is set)
            $table->foreignId('book_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('slides');
    }
};
