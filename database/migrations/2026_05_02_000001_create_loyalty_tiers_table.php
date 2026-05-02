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
        Schema::create('loyalty_tiers', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Bronze, Silver, Gold, Platinum
            $table->string('color')->default('#8B7355'); // Bronze color default
            $table->integer('min_points')->default(0); // Minimum points required for this tier
            $table->integer('max_points')->nullable(); // Maximum points for this tier (null = unlimited)
            $table->string('discount_type')->default('percentage'); // percentage or fixed
            $table->decimal('discount_value', 8, 2)->default(0); // Discount value
            $table->decimal('max_discount_amount', 8, 2)->nullable(); // Maximum discount amount cap
            $table->text('description')->nullable();
            $table->text('benefits')->nullable(); // JSON or text describing benefits
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0); // For ordering tiers
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loyalty_tiers');
    }
};