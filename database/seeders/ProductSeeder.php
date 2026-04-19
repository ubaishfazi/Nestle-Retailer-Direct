<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Beverages', 'description' => 'Drinks and beverage products'],
            ['name' => 'Breakfast', 'description' => 'Breakfast cereals and products'],
            ['name' => 'Confectionery', 'description' => 'Chocolates and sweets'],
            ['name' => 'Baby Food', 'description' => 'Baby nutrition products'],
            ['name' => 'Dairy', 'description' => 'Dairy and creamer products'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }

        $products = [
            [
                'name' => 'Nestlé Milo 180ml',
                'description' => 'Malted chocolate drink rich in iron and calcium',
                'price' => 150.00,
                'image_url' => '/milo.jpeg',
                'category_id' => 1,
                'stock_quantity' => 50,
            ],
            [
                'name' => 'Nestlé KitKat 45g',
                'description' => 'Crispy wafer fingers covered in milk chocolate',
                'price' => 220.00,
                'image_url' => '/Nestlé KitKat Bar.jpg',
                'category_id' => 3,
                'stock_quantity' => 100,
            ],
            [
                'name' => 'Nestlé Nestomolt 400g',
                'description' => 'Nutritional supplement drink',
                'price' => 770.00,
                'image_url' => '/nestemolt 400g.jpeg',
                'category_id' => 1,
                'stock_quantity' => 30,
            ],
            [
                'name' => 'Maggi 70g',
                'description' => 'Instant noodles',
                'price' => 100.00,
                'image_url' => '/maggie 70g.jpg',
                'category_id' => 2,
                'stock_quantity' => 50,
            ],
            [
                'name' => 'Nescafe Classic 100g',
                'description' => 'Classic instant coffee',
                'price' => 1950.00,
                'image_url' => '/nestle coffeeeeeeeeeeeee 100g.jpeg',
                'category_id' => 1,
                'stock_quantity' => 20,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
