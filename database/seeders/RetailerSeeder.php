<?php

namespace Database\Seeders;

use App\Models\ShopProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RetailerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a test retailer account
        $retailer = User::create([
            'name' => 'Test Retailer',
            'email' => 'retailer@test.com',
            'password' => Hash::make('password123'),
            'role' => 'retailer',
        ]);

        // Create shop profile for the retailer
        ShopProfile::create([
            'user_id' => $retailer->id,
            'shop_name' => 'Test Retail Shop',
            'shop_address' => '123 Main Street, Colombo',
            'shop_city' => 'Colombo',
            'shop_phone' => '+94 77 123 4567',
            'shop_license' => null,
            'notes' => null,
        ]);

        $this->command->info('Retailer account created successfully!');
        $this->command->info('Email: retailer@test.com');
        $this->command->info('Password: password123');
        $this->command->info('Shop Name: Test Retail Shop');
        $this->command->info('Shop Address: 123 Main Street, Colombo');
        $this->command->info('Shop Phone: +94 77 123 4567');
    }
}
