<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LaptopFeatureSeeder extends Seeder
{
    public function run(): void
    {
        $products = DB::table('products')->get();

        $features = [
            [
                'product_id' => $products[0]->product_id,
                'brand' => 'ASUS',
                'processor' => 'AMD Ryzen 9 7940HS',
                'ram' => 16,
                'storage' => 512,
                'screen_size' => 15.6,
                'gpu' => 'NVIDIA RTX 4060',
                'price_range' => 'premium',
                'weight' => 2.3,
                'battery_life' => 6,
                'purpose' => 'gaming',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'product_id' => $products[1]->product_id,
                'brand' => 'MSI',
                'processor' => 'Intel i7-13620H',
                'ram' => 16,
                'storage' => 512,
                'screen_size' => 15.6,
                'gpu' => 'NVIDIA RTX 4050',
                'price_range' => 'mid-range',
                'weight' => 2.2,
                'battery_life' => 5,
                'purpose' => 'gaming',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'product_id' => $products[2]->product_id,
                'brand' => 'Dell',
                'processor' => 'Intel i5-1245U',
                'ram' => 8,
                'storage' => 256,
                'screen_size' => 14.0,
                'gpu' => 'Intel Iris Xe',
                'price_range' => 'mid-range',
                'weight' => 1.4,
                'battery_life' => 10,
                'purpose' => 'office',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('laptop_features')->insert($features);
    }
}