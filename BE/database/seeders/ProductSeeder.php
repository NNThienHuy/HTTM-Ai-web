<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\LaptopFeature;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Tạo 50 sản phẩm
        Product::factory(50)->create()->each(function ($product) {
            // Với mỗi sản phẩm, tạo 1 thông số kỹ thuật đi kèm
            LaptopFeature::factory()->create([
                'product_id' => $product->product_id,
                // Đảm bảo brand của feature khớp với tên sản phẩm cho logic
                'brand' => explode(' ', $product->name)[0] 
            ]);
        });
    }
}