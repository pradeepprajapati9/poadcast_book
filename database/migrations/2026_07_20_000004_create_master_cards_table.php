<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Master card — a metro-card style pass that unlocks every book while it
     * is in date.
     *
     * Unlike an access_code (one-shot, tied to one book), a card is permanent
     * identity: the code never changes and recharges push `expires_at` further
     * out. That split is what makes "recharge" possible at all.
     */
    public function up(): void
    {
        Schema::create('master_cards', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();          // printed on the card + QR
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('claimed_at')->nullable();
            $table->timestamp('expires_at')->nullable(); // null = never recharged yet
            $table->boolean('is_active')->default(true); // admin kill switch
            $table->unsignedTinyInteger('device_limit')->default(3);
            $table->string('batch')->nullable();
            $table->timestamps();

            $table->index('expires_at');
        });

        // Every top-up, whatever its source. Kept as history so a disputed card
        // can be traced, and so online payments can be added later as just
        // another `source` without touching the card itself.
        Schema::create('card_recharges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('master_card_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('months');
            $table->string('source')->default('voucher'); // voucher | admin | online
            $table->string('reference')->nullable();      // voucher code / payment id
            $table->timestamp('expires_at_after');        // card validity after this top-up
            $table->timestamps();
        });

        // Printed ₹99-style slips that add months to a card.
        Schema::create('recharge_vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->unsignedSmallInteger('months')->default(1);
            $table->foreignId('used_by_card_id')->nullable()->constrained('master_cards')->nullOnDelete();
            $table->timestamp('used_at')->nullable();
            $table->string('batch')->nullable();
            $table->timestamps();
        });

        // Devices a card has been used on, so one card cannot be shared with
        // the whole neighbourhood.
        Schema::create('card_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('master_card_id')->constrained()->cascadeOnDelete();
            $table->string('token', 64);
            $table->string('label')->nullable();       // browser / OS guess
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();

            $table->unique(['master_card_id', 'token']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('card_devices');
        Schema::dropIfExists('recharge_vouchers');
        Schema::dropIfExists('card_recharges');
        Schema::dropIfExists('master_cards');
    }
};
