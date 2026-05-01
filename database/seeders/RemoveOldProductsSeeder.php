<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\DistributorInventory;
use App\Models\RetailerInventory;

class RemoveOldProductsSeeder extends Seeder
{
    /**
     * Remove legacy products (Cerelac, Pure Life, Coffee Mate) and their inventories.
     */
    public function run(): void
    {
        $names = [
            'Nestlé Cerelac Wheat 1kg',
            'Nestlé Pure Life 500ml',
            'Nestlé Coffee Mate 50g',
        ];

        $products = Product::whereIn('name', $names)->get();

        if ($products->isEmpty()) {
            return;
        }

        $ids = $products->pluck('id')->toArray();

        // Remove any distributor/retailer inventory rows referencing these products
        DistributorInventory::whereIn('product_id', $ids)->delete();
        if (class_exists(RetailerInventory::class)) {
            RetailerInventory::whereIn('product_id', $ids)->delete();
        }

        // Delete the products themselves
        Product::whereIn('id', $ids)->delete();
    }
}
