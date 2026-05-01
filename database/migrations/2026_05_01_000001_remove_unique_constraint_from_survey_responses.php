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
        if (! Schema::hasTable('survey_responses')) {
            return;
        }

        // Get all indexes on the table
        $indexes = \Illuminate\Support\Facades\DB::select("SHOW INDEX FROM `survey_responses`");
        
        foreach ($indexes as $index) {
            $keyName = $index->Key_name ?? $index['Key_name'] ?? null;
            
            // Skip primary key
            if ($keyName === 'PRIMARY') {
                continue;
            }
            
            // Check if this is a unique index on survey_id and retailer_id
            if ($keyName === 'survey_responses_survey_id_retailer_id_unique') {
                try {
                    \Illuminate\Support\Facades\DB::statement("ALTER TABLE `survey_responses` DROP INDEX `" . $keyName . "`");
                } catch (\Exception $e) {
                    // Index might not exist, ignore
                }
            }
        }

        // Create a non-unique index if it doesn't exist
        $hasNonUniqueIndex = false;
        foreach ($indexes as $index) {
            $keyName = $index->Key_name ?? $index['Key_name'] ?? null;
            if ($keyName === 'idx_survey_retailer') {
                $hasNonUniqueIndex = true;
                break;
            }
        }

        if (! $hasNonUniqueIndex) {
            try {
                \Illuminate\Support\Facades\DB::statement("ALTER TABLE `survey_responses` ADD INDEX `idx_survey_retailer` (`survey_id`,`retailer_id`)");
            } catch (\Exception $e) {
                // Index might already exist
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Nothing to do here - we don't want to restore the unique constraint
    }
};
