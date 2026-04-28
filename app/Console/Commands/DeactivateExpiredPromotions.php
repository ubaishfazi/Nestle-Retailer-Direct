<?php

namespace App\Console\Commands;

use App\Models\Promotion;
use Carbon\Carbon;
use Illuminate\Console\Command;

class DeactivateExpiredPromotions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'promotions:deactivate-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically deactivate expired promotions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = Carbon::now();

        // Find expired promotions that are still active
        $expiredPromotions = Promotion::where('is_active', true)
            ->where('expiry_date', '<', $now)
            ->get();

        if ($expiredPromotions->isEmpty()) {
            $this->info('No expired promotions found.');

            return Command::SUCCESS;
        }

        $count = $expiredPromotions->count();
        $this->info("Found {$count} expired promotion(s) to deactivate.");

        foreach ($expiredPromotions as $promotion) {
            $promotion->update(['is_active' => false]);
            $this->line("✓ Deactivated: {$promotion->title} ({$promotion->promo_code})");
        }

        $this->info("Successfully deactivated {$count} expired promotion(s).");

        return Command::SUCCESS;
    }
}
