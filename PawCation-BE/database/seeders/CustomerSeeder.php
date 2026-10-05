<?php

namespace Database\Seeders;

use App\Models\Pet;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $customer = User::firstOrCreate(
            ['email' => 'customer@pawcation.com'],
            [
                'name' => 'Jeky',
                'password' => Hash::make('password123'),
                'role' => 'customer',
            ]
        );

        Pet::firstOrCreate(
            ['user_id' => $customer->id, 'name' => 'Choco'],
            ['type' => 'kucing', 'breed' => 'Domestic Short Hair', 'age' => 2]
        );

        Pet::firstOrCreate(
            ['user_id' => $customer->id, 'name' => 'Bruno'],
            ['type' => 'anjing', 'breed' => 'Golden Retriever', 'age' => 3]
        );
    }
}
