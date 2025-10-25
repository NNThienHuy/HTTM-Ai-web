<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Đảm bảo có dữ liệu brand/category trước
        if (Brand::count() < 6) {
            Brand::factory(8)->create();
        }
        if (Category::count() < 6) {
            Category::factory(8)->create();
        }

        // Tạo 60 sản phẩm hỗn hợp (gaming/office/other)
        Product::factory(20)->gaming()->create();
        Product::factory(20)->office()->create();
        Product::factory(20)->create();
    }
}
