<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Promotion;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PromotionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();
        $products = Product::all();

        // Promotion 1: Percentage discount on all products
        Promotion::create([
            'title' => 'Spring Sale 2026',
            'description' => 'Get 15% off on all Nestlé products! Limited time offer for our valued retailers.',
            'promo_code' => 'SPRING2026',
            'discount_type' => 'percentage',
            'discount_value' => 15.00,
            'minimum_order_amount' => 100.00,
            'maximum_discount_amount' => 200.00,
            'start_date' => $now->copy(),
            'expiry_date' => $now->copy()->addDays(30),
            'is_active' => true,
            'usage_limit' => 100,
            'usage_count' => 0,
        ]);

        // Promotion 2: Fixed discount
        Promotion::create([
            'title' => 'New Retailer Welcome Bonus',
            'description' => 'Welcome to Nestlé Retailer Direct! Enjoy $50 off your first order.',
            'promo_code' => 'WELCOME50',
            'discount_type' => 'fixed',
            'discount_value' => 50.00,
            'minimum_order_amount' => 200.00,
            'maximum_discount_amount' => null,
            'start_date' => $now->copy(),
            'expiry_date' => $now->copy()->addMonths(3),
            'is_active' => true,
            'usage_limit' => null,
            'usage_count' => 0,
        ]);

        // Promotion 3: Small percentage discount, no limits
        Promotion::create([
            'title' => 'Loyalty Rewards Program',
            'description' => 'Thank you for your continued loyalty! Enjoy 10% off on your orders.',
            'promo_code' => 'LOYALTY10',
            'discount_type' => 'percentage',
            'discount_value' => 10.00,
            'minimum_order_amount' => null,
            'maximum_discount_amount' => null,
            'start_date' => $now->copy()->subDays(10),
            'expiry_date' => $now->copy()->addDays(60),
            'is_active' => true,
            'usage_limit' => null,
            'usage_count' => 0,
        ]);

        // Promotion 4: Product-specific promotion (if products exist)
        if ($products->isNotEmpty()) {
            $promotion5 = Promotion::create([
                'title' => 'Featured Product Special',
                'description' => 'Special discount on selected premium Nestlé products.',
                'promo_code' => 'FEATURED20',
                'discount_type' => 'percentage',
                'discount_value' => 20.00,
                'minimum_order_amount' => 50.00,
                'maximum_discount_amount' => 100.00,
                'start_date' => $now->copy(),
                'expiry_date' => $now->copy()->addDays(45),
                'is_active' => true,
                'usage_limit' => 50,
                'usage_count' => 0,
            ]);

            // Attach random products to this promotion
            $randomProducts = $products->random(min(3, $products->count()));
            $promotion5->products()->attach($randomProducts->pluck('id')->toArray());
        }

        // Promotion 5: Expired promotion (for testing)
        Promotion::create([
            'title' => 'Expired New Year Sale',
            'description' => 'This is an expired promotion for testing purposes.',
            'promo_code' => 'NEWYEAR2025',
            'discount_type' => 'percentage',
            'discount_value' => 25.00,
            'minimum_order_amount' => 150.00,
            'maximum_discount_amount' => 300.00,
            'start_date' => $now->copy()->subDays(60),
            'expiry_date' => $now->copy()->subDays(30),
            'is_active' => false,
            'usage_limit' => null,
            'usage_count' => 45,
        ]);

        // Promotion 6: Scheduled promotion (starts in the future)
        Promotion::create([
            'title' => 'Summer Extravaganza',
            'description' => 'Get ready for summer with amazing discounts on all Nestlé products!',
            'promo_code' => 'SUMMER25',
            'discount_type' => 'percentage',
            'discount_value' => 25.00,
            'minimum_order_amount' => 250.00,
            'maximum_discount_amount' => 500.00,
            'start_date' => $now->copy()->addDays(30),
            'expiry_date' => $now->copy()->addDays(90),
            'is_active' => true,
            'usage_limit' => 200,
            'usage_count' => 0,
        ]);
    }
}
