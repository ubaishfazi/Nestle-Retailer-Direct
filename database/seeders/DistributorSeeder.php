<?php

namespace Database\Seeders;

use App\Models\DistributorInventory;
use App\Models\DistributorProfile;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DistributorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $distributors = [
            [
                'name' => 'Janaka',
                'email' => 'janaka@nestle.com',
                'company_name' => 'Akurana Branch',
                'company_address' => 'Main Street, Akurana',
                'company_city' => 'Kandy',
                'company_phone' => '0812345678',
            ],
            [
                'name' => 'Kamal Perera',
                'email' => 'kamal@nestle.com',
                'company_name' => 'Kandy Distribution Center',
                'company_address' => 'Distributor Road',
                'company_city' => 'Kandy',
                'company_phone' => '0812345679',
            ],
            [
                'name' => 'Sunil Silva',
                'email' => 'sunil@nestle.com',
                'company_name' => 'Colombo Branch',
                'company_address' => 'High Level Road',
                'company_city' => 'Colombo',
                'company_phone' => '0112345678',
            ],
        ];

        // Get all 5 Nestlé products
        $products = Product::all();

        // Initial warehouse stock for each product (for demo purposes)
        // Product IDs correspond to ProductSeeder order: 1=Milo, 2=KitKat, 3=Nestomolt, 4=Maggi, 5=Nescafe
        $initialStock = [
            1 => 100, // Nestlé Milo 180ml
            2 => 200, // Nestlé KitKat 45g
            3 => 50,  // Nestlé Nestomolt 400g
            4 => 150, // Maggi 70g
            5 => 300, // Nescafe Classic 100g
        ];

        foreach ($distributors as $distributorData) {
            $user = User::create([
                'name' => $distributorData['name'],
                'email' => $distributorData['email'],
                'password' => Hash::make('password123'),
                'role' => 'distributor',
            ]);

            DistributorProfile::create([
                'user_id' => $user->id,
                'company_name' => $distributorData['company_name'],
                'company_address' => $distributorData['company_address'],
                'company_city' => $distributorData['company_city'],
                'company_phone' => $distributorData['company_phone'],
            ]);

            // Create distributor inventory for all 5 products
            foreach ($products as $product) {
                DistributorInventory::create([
                    'user_id' => $user->id,
                    'product_id' => $product->id,
                    'stock_quantity' => $initialStock[$product->id] ?? 0,
                ]);
            }
        }
    }
}
