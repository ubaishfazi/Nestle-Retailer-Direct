<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed admin user and Nestlé products
        $this->call([
            AdminUserSeeder::class,
            ProductSeeder::class,
            // Remove legacy/unwanted products if present
            RemoveOldProductsSeeder::class,
            PromotionSeeder::class,
        ]);
    }
}
