<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A book now has exactly one access code.
     *
     * Existing books may hold many, so the extras are dropped first — keeping
     * the redeemed one where there is one, since that code is already in a
     * reader's hands and printed on a packet.
     */
    public function up(): void
    {
        $keep = DB::table('access_codes')
            ->select(DB::raw('MIN(id) as id'))
            ->whereNotNull('redeemed_at')
            ->groupBy('book_id')
            ->pluck('id')
            ->all();

        $booksWithRedeemed = DB::table('access_codes')
            ->whereIn('id', $keep)
            ->pluck('book_id')
            ->all();

        // For books with no redeemed code, keep the oldest one.
        $keep = array_merge($keep, DB::table('access_codes')
            ->select(DB::raw('MIN(id) as id'))
            ->when($booksWithRedeemed, fn ($q) => $q->whereNotIn('book_id', $booksWithRedeemed))
            ->groupBy('book_id')
            ->pluck('id')
            ->all());

        DB::table('access_codes')->whereNotIn('id', $keep)->delete();

        Schema::table('access_codes', function (Blueprint $table) {
            $table->unique('book_id');
        });
    }

    public function down(): void
    {
        Schema::table('access_codes', function (Blueprint $table) {
            $table->dropUnique(['book_id']);
        });
    }
};
