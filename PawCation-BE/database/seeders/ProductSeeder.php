<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Migrasi kategori lama -> baru TANPA menghapus produk.
        // Menghapus produk akan ikut menghapus isi pesanan (order_items cascadeOnDelete).
        $legacy = [
            'Royal Canin Maxi Adult' => ['category' => 'Makanan Anjing'],
            'Dog Chew Toy' => ['name' => 'Dog Chew Toy Bone', 'category' => 'Snack Anjing'],
            'Pet Shampoo Anti Kutu' => ['category' => 'Perawatan'],
            'Fish Food Pellet' => ['is_active' => false],
        ];
        foreach ($legacy as $name => $changes) {
            Product::where('name', $name)->update($changes);
        }

        $products = [
            // Makanan Anjing
            ['name' => 'Royal Canin Maxi Adult', 'price' => 850000, 'category' => 'Makanan Anjing', 'emoji' => '🍖', 'photo' => '/images/products/royal-canin.jpg', 'stock' => 50],
            ['name' => 'Pedigree Adult Beef 3kg', 'price' => 120000, 'category' => 'Makanan Anjing', 'emoji' => '🍖', 'photo' => '/images/products/pedigree.jpg', 'stock' => 80],

            // Snack Anjing
            ['name' => 'Dog Chew Toy Bone', 'price' => 45000, 'category' => 'Snack Anjing', 'emoji' => '🦴', 'photo' => '/images/products/chew-bone.jpg', 'stock' => 60],
            ['name' => 'Dentastix Snack Anjing', 'price' => 55000, 'category' => 'Snack Anjing', 'emoji' => '🦴', 'photo' => '/images/products/dentastix.jpg', 'stock' => 70],

            // Makanan Kucing
            ['name' => 'Whiskas Tuna 1.2kg', 'price' => 95000, 'category' => 'Makanan Kucing', 'emoji' => '🐟', 'photo' => '/images/products/whiskas.jpg', 'stock' => 90],
            ['name' => 'Me-O Persian Adult', 'price' => 78000, 'category' => 'Makanan Kucing', 'emoji' => '🐟', 'photo' => '/images/products/meo.jpg', 'stock' => 85],

            // Snack Kucing
            ['name' => 'Creamy Treats Kucing', 'price' => 32000, 'category' => 'Snack Kucing', 'emoji' => '🍤', 'photo' => '/images/products/creamy-treats.jpg', 'stock' => 120],
            ['name' => 'Catnip Snack Stick', 'price' => 28000, 'category' => 'Snack Kucing', 'emoji' => '🍤', 'photo' => '/images/products/catnip.jpg', 'stock' => 110],

            // Mainan
            ['name' => 'Bola Mainan Interaktif', 'price' => 40000, 'category' => 'Mainan', 'emoji' => '🎾', 'photo' => '/images/products/ball.jpg', 'stock' => 65],
            ['name' => 'Tali Tarik Gigit', 'price' => 35000, 'category' => 'Mainan', 'emoji' => '🧶', 'photo' => '/images/products/rope.jpg', 'stock' => 55],

            // Perawatan (umum)
            ['name' => 'Pet Shampoo Anti Kutu', 'price' => 38000, 'category' => 'Perawatan', 'emoji' => '🧴', 'photo' => '/images/products/shampoo.jpg', 'stock' => 100],
        ];

        foreach ($products as $p) {
            Product::updateOrCreate(['name' => $p['name']], $p);
        }
    }
}
