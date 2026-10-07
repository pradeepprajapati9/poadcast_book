<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chapters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('number');
            $table->string('title');
            $table->longText('content')->nullable(); // HTML body of the chapter
            $table->string('image')->nullable();      // optional in-chapter illustration
            $table->boolean('is_free')->default(false); // free preview chapter
            $table->date('published_at')->nullable();
            $table->timestamps();

            $table->unique(['book_id', 'number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chapters');
    }
};
