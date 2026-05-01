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
        Schema::create('survey_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('survey_id')->constrained('surveys')->onDelete('cascade');
            $table->foreignId('retailer_id')->constrained('users')->onDelete('cascade');
            $table->text('additional_comments')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            // Allow multiple responses from the same retailer to the same survey
            // (e.g., if they want to update their feedback)
            $table->index(['survey_id', 'retailer_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('survey_responses');
    }
};
