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
        Schema::create('survey_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('survey_id')->constrained('surveys')->onDelete('cascade');
            $table->string('question_text');
            $table->enum('question_type', ['text', 'textarea', 'product_suggestion', 'product_selection'])->default('text');
            $table->string('placeholder')->nullable();
            $table->boolean('is_required')->default(true);
            $table->integer('order')->default(0);
            $table->json('options')->nullable();
            $table->timestamps();

            $table->index('survey_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('survey_questions');
    }
};
