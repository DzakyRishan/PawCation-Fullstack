<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        Product::firstOrCreate(
            ['name' => 'Royal Canin Maxi Adult'],
            ['price' => 850000, 'category' => 'Dog', 'emoji' => '🍖', 'stock' => 50]
        );
        Product::firstOrCreate(
            ['name' => 'Pet Shampoo Anti Kutu'],
            ['price' => 38000, 'category' => 'All', 'emoji' => '🧴', 'stock' => 100]
        );
        Product::firstOrCreate(
            ['name' => 'Fish Food Pellet'],
            ['price' => 25000, 'category' => 'Fish', 'emoji' => '🐟', 'stock' => 75]
        );
        Product::firstOrCreate(
            ['name' => 'Dog Chew Toy'],
            ['price' => 45000, 'category' => 'Dog', 'emoji' => '🦴', 'stock' => 30]
        );
    }
}