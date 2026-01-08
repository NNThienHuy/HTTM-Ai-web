<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
        ProductCategorySeeder::class,
        ProductSeeder::class,
        LaptopFeatureSeeder::class,
        WarehouseSeeder::class,    
        AccountSeeder::class,
        CustomerSeeder::class,
        InteractionSeeder::class,
        RandomInteractionSeeder::class,
        ]);
    }
}