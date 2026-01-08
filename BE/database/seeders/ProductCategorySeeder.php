<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['category_name' => 'Gaming Laptop', 'parent_category_id' => null, 'created_at' => now(), 'updated_at' => now()],
            ['category_name' => 'Business Laptop', 'parent_category_id' => null, 'created_at' => now(), 'updated_at' => now()],
            ['category_name' => 'Ultrabook', 'parent_category_id' => null, 'created_at' => now(), 'updated_at' => now()],
            ['category_name' => 'Workstation', 'parent_category_id' => null, 'created_at' => now(), 'updated_at' => now()],
            ['category_name' => 'Budget Laptop', 'parent_category_id' => null, 'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('product_categories')->insert($categories);
    }
}