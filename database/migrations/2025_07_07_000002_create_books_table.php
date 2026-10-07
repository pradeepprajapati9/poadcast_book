<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('subtitle')->nullable();
            $table->string('author')->nullable();
            $table->string('tagline')->nullable();
            $table->text('description')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('banner_image')->nullable();
            $table->enum('status', ['ongoing', 'completed'])->default('ongoing');
            $table->decimal('rating', 2, 1)->default(0);
            $table->unsignedInteger('views')->default(0);
            $table->unsignedInteger('price')->default(30); // ₹ price of the access pack
            $table->unsignedTinyInteger('access_months')->default(3);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
