<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('category')->get()->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => (float) $product->price,
                'image' => $product->image_url ?? '/images/placeholder-product.png',
                'category' => $product->category?->name ?? 'Uncategorized',
                'stock_status' => $product->stock_quantity > 10 ? 'in_stock' : ($product->stock_quantity > 0 ? 'low_stock' : 'out_of_stock'),
                'stock_quantity' => $product->stock_quantity ?? 0,
            ];
        });

        $categories = Category::pluck('name')->toArray();

        return inertia('products/index', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }
}
