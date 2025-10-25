<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Brand;      
use App\Models\Category;   
use App\Models\Product;    
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // === 1. TẠO USERS (Code này bạn đã có) ===
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);
        User::create([
            'name' => 'Customer User',
            'email' => 'customer@example.com',
            'password' => Hash::make('user123'),
            'role' => 'customer',
            'email_verified_at' => now(),
        ]);
        User::factory(10)->create();
        Brand::factory(10)->create();
        Category::factory(5)->create();
        Product::factory(50)->create();
        Category::factory(3)->create([
             'parent_id' => Category::inRandomOrder()->first()->id
        ]);
        $this->call([
        CartSeeder::class,
        
    ]);
        $this->call([
        ProductSeeder::class,
    ]);
    }
}