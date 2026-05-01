<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // The options field already exists and can store product_ids as JSON
        // We'll use it to store an array of product IDs for product_selection type
        // No schema change needed for this feature
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No schema change to reverse
    }
};
