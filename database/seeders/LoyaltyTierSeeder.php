<?php

namespace Database\Seeders;

use App\Models\LoyaltyTier;
use Illuminate\Database\Seeder;

class LoyaltyTierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing tiers - use delete() instead of truncate() to avoid foreign key issues
        LoyaltyTier::whereNotNull('id')->delete();

        // Create default loyalty tiers
        $tiers = [
            [
                'name' => 'Bronze',
                'color' => '#CD7F32', // Bronze color
                'min_points' => 0,
                'max_points' => 4999,
                'discount_type' => 'percentage',
                'discount_value' => 2.00, // 2% discount
                'max_discount_amount' => null,
                'description' => 'Entry level tier for all new retailers',
                'benefits' => 'Earn 2% discount on all orders. Start building your loyalty points with every purchase.',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Silver',
                'color' => '#C0C0C0', // Silver color
                'min_points' => 5000,
                'max_points' => 14999,
                'discount_type' => 'percentage',
                'discount_value' => 3.50, // 3.5% discount
                'max_discount_amount' => null,
                'description' => 'For growing retailers with consistent orders',
                'benefits' => 'Earn 3.5% discount on all orders. Priority customer support and exclusive access to new products.',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Gold',
                'color' => '#FFD700', // Gold color
                'min_points' => 15000,
                'max_points' => 29999,
                'discount_type' => 'percentage',
                'discount_value' => 5.00, // 5% discount
                'max_discount_amount' => null,
                'description' => 'For established retailers with high order volume',
                'benefits' => 'Earn 5% discount on all orders. Dedicated account manager, early access to promotions, and free delivery on orders over LKR 50,000.',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Platinum',
                'color' => '#E5E4E2', // Platinum color
                'min_points' => 30000,
                'max_points' => null, // No upper limit
                'discount_type' => 'percentage',
                'discount_value' => 7.50, // 7.5% discount
                'max_discount_amount' => null,
                'description' => 'Our most prestigious tier for top retailers',
                'benefits' => 'Earn 7.5% discount on all orders. VIP treatment with dedicated account manager, exclusive events, custom pricing, and priority delivery.',
                'is_active' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($tiers as $tier) {
            LoyaltyTier::create($tier);
        }

        $this->command->info('Loyalty tiers created successfully!');
    }
}