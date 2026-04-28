<?php

namespace Database\Seeders;

use App\Models\DistributorProfile;
use App\Models\ShopProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

class FixExistingProfilesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "Fixing existing user profiles...\n";

        // Fix retailer profiles
        $retailers = User::where('role', 'retailer')->get();
        foreach ($retailers as $retailer) {
            $shopProfile = $retailer->shopProfile;

            if (! $shopProfile) {
                // Create shop profile if it doesn't exist
                ShopProfile::create([
                    'user_id' => $retailer->id,
                    'shop_name' => null,
                    'shop_address' => null,
                    'shop_city' => null,
                    'shop_phone' => null,
                ]);
                echo "Created shop profile for retailer ID: {$retailer->id}\n";
            }
        }

        // Fix distributor profiles
        $distributors = User::where('role', 'distributor')->get();
        foreach ($distributors as $distributor) {
            $distributorProfile = $distributor->distributorProfile;

            if (! $distributorProfile) {
                // Create distributor profile if it doesn't exist
                DistributorProfile::create([
                    'user_id' => $distributor->id,
                    'company_name' => null,
                    'company_address' => null,
                    'company_city' => null,
                    'company_phone' => null,
                ]);
                echo "Created distributor profile for distributor ID: {$distributor->id}\n";
            }
        }

        echo "Profile fix completed!\n";
    }
}
