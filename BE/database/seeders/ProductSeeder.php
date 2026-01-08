<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Lấy danh sách ID các danh mục để gán cho sản phẩm
        $categories = DB::table('product_categories')->pluck('category_id', 'category_name');

        $laptops = [
            // GAMING
            ['name' => 'ASUS ROG Strix G15', 'price' => 35000000, 'cat' => 'Gaming Laptop', 'brand' => 'ASUS'],
            ['name' => 'MSI Katana 15', 'price' => 28000000, 'cat' => 'Gaming Laptop', 'brand' => 'MSI'],
            ['name' => 'Acer Predator Helios Neo 16', 'price' => 38000000, 'cat' => 'Gaming Laptop', 'brand' => 'Acer'],
            ['name' => 'Lenovo Legion 5 Pro', 'price' => 42000000, 'cat' => 'Gaming Laptop', 'brand' => 'Lenovo'],
            ['name' => 'HP Victus 16', 'price' => 22000000, 'cat' => 'Gaming Laptop', 'brand' => 'HP'],
            ['name' => 'Gigabyte G5 KF', 'price' => 24000000, 'cat' => 'Gaming Laptop', 'brand' => 'Gigabyte'],
            ['name' => 'Dell Alienware m16', 'price' => 65000000, 'cat' => 'Gaming Laptop', 'brand' => 'Dell'],

            // BUSINESS / ULTRABOOK
            ['name' => 'Dell Latitude 5430', 'price' => 18000000, 'cat' => 'Business Laptop', 'brand' => 'Dell'],
            ['name' => 'MacBook Air M2', 'price' => 26500000, 'cat' => 'Ultrabook', 'brand' => 'Apple'],
            ['name' => 'HP Spectre x360', 'price' => 34000000, 'cat' => 'Ultrabook', 'brand' => 'HP'],
            ['name' => 'Lenovo ThinkPad X1 Carbon Gen 11', 'price' => 45000000, 'cat' => 'Business Laptop', 'brand' => 'Lenovo'],
            ['name' => 'Asus Zenbook 14 OLED', 'price' => 25000000, 'cat' => 'Ultrabook', 'brand' => 'ASUS'],
            ['name' => 'LG Gram 2023', 'price' => 31000000, 'cat' => 'Ultrabook', 'brand' => 'LG'],
            ['name' => 'Microsoft Surface Laptop 5', 'price' => 29000000, 'cat' => 'Ultrabook', 'brand' => 'Microsoft'],

            // WORKSTATION / BUDGET
            ['name' => 'Dell Precision 3581', 'price' => 52000000, 'cat' => 'Workstation', 'brand' => 'Dell'],
            ['name' => 'HP ZBook Firefly', 'price' => 48000000, 'cat' => 'Workstation', 'brand' => 'HP'],
            ['name' => 'Acer Swift 3', 'price' => 15000000, 'cat' => 'Budget Laptop', 'brand' => 'Acer'],
            ['name' => 'Asus Vivobook 15', 'price' => 13500000, 'cat' => 'Budget Laptop', 'brand' => 'ASUS'],
            ['name' => 'Lenovo IdeaPad Slim 3', 'price' => 12000000, 'cat' => 'Budget Laptop', 'brand' => 'Lenovo'],
            ['name' => 'Huawei MateBook D15', 'price' => 14000000, 'cat' => 'Budget Laptop', 'brand' => 'Huawei'],
        ];

        $insertData = [];
        foreach ($laptops as $laptop) {
            $insertData[] = [
                'name' => $laptop['name'],
                'description' => "Dòng laptop cao cấp từ {$laptop['brand']}, hỗ trợ tốt cho nhu cầu {$laptop['cat']}.",
                'price' => $laptop['price'],
                'category_id' => $categories[$laptop['cat']] ?? $categories->first(), // Gán ID danh mục
                'image_url' => '/images/laptops/default.jpg',
                'stock_quantity' => rand(5, 50),
                'rating' => rand(40, 50) / 10,
                'views' => rand(100, 2000), // View ngẫu nhiên để test popular
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('products')->insert($insertData);
    }
}