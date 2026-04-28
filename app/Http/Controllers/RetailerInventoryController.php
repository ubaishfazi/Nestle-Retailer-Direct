<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\RetailerInventory;

class RetailerInventoryController extends Controller
{
    /**
     * Display retailer's inventory.
     */
    public function index()
    {
        $retailerId = auth()->id();

        // Get all products with retailer's inventory quantities
        $products = Product::all()->map(function ($product) use ($retailerId) {
            $retailerInventory = RetailerInventory::where('user_id', $retailerId)
                ->where('product_id', $product->id)
                ->first();

            $retailerQuantity = $retailerInventory ? $retailerInventory->stock_quantity : 0;

            return [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => (float) $product->price,
                'image' => $product->image_url ?? '/images/placeholder-product.png',
                'stock_status' => $retailerQuantity > 20 ? 'in_stock' : ($retailerQuantity > 0 ? 'low_stock' : 'out_of_stock'),
                'stock_quantity' => $retailerQuantity,
            ];
        });

        $stats = [
            'total_products' => $products->count(),
            'in_stock' => $products->filter(fn ($p) => $p['stock_status'] === 'in_stock')->count(),
            'low_stock' => $products->filter(fn ($p) => $p['stock_status'] === 'low_stock')->count(),
            'out_of_stock' => $products->filter(fn ($p) => $p['stock_status'] === 'out_of_stock')->count(),
        ];

        return inertia('retailer/inventory', [
            'products' => $products,
            'stats' => $stats,
        ]);
    }
}
