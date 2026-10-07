<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Pricing the admin controls: "3 months — ₹50", "6 months — ₹90".
        Schema::create('card_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedSmallInteger('months');
            $table->unsignedInteger('price');            // whole rupees
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        // One purchase attempt: buying a new card, or renewing an existing one.
        // Money is confirmed out-of-band today (cash / UPI screenshot), so an
        // order sits at `pending` until someone marks it paid. When a gateway
        // is added it just flips the same row to `paid` automatically.
        Schema::create('card_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('master_card_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('card_plan_id')->nullable()->constrained()->nullOnDelete();

            $table->unsignedSmallInteger('months');
            $table->unsignedInteger('amount');
            $table->string('kind')->default('new');       // new | renewal
            $table->string('status')->default('pending'); // pending | paid | cancelled
            $table->string('method')->nullable();         // cash | upi | online
            $table->string('reference')->nullable();      // UPI txn id / receipt no.
            $table->timestamp('paid_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });

        Schema::table('master_cards', function (Blueprint $table) {
            // Where the card came from, so physical stock and web signups can
            // be told apart in reporting.
            $table->string('source')->default('physical')->after('batch');
        });
    }

    public function down(): void
    {
        Schema::table('master_cards', fn (Blueprint $table) => $table->dropColumn('source'));
        Schema::dropIfExists('card_orders');
        Schema::dropIfExists('card_plans');
    }
};
