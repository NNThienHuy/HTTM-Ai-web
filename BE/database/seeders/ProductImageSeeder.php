<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class ProductImageSeeder extends Seeder
{
    public function run()
    {
        // Danh sách tên các file ảnh bạn vừa chép vào folder
        $images = [
            'images/products/dell_01.jpeg',
            'images/products/dell.jpeg',
            'images/products/lenovo_01.jpeg',
            'images/products/lenovo.jpeg',
            'images/products/macbook_m1.jpeg',
        ];

        // Lấy tất cả sản phẩm
        $products = Product::all();

        foreach ($products as $product) {
            // Chọn ngẫu nhiên 1 ảnh từ danh sách
            $randomImage = $images[array_rand($images)];

            // Cập nhật vào DB
            // Giả sử cột trong DB của bạn tên là 'image_url' hoặc 'image'
            $product->update([
                'image_url' => $randomImage
            ]);
        }
        
        echo "Đã cập nhật ảnh cho " . $products->count() . " sản phẩm thành công!\n";
    }
}