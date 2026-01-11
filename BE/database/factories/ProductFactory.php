<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\ProductCategory;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        $brands = ['Dell', 'HP', 'Lenovo', 'Asus', 'MacBook', 'MSI', 'Acer'];
        $series = ['Inspiron', 'Pavilion', 'ThinkPad', 'ROG Strix', 'Air', 'Pro', 'Nitro'];
        
        $name = $this->faker->randomElement($brands) . ' ' . 
                $this->faker->randomElement($series) . ' ' . 
                $this->faker->numberBetween(2023, 2025);

        return [
            'name' => $name, // Tên ví dụ: Dell Inspiron 2024
            'description' => "Laptop " . $name . " chính hãng, cấu hình mạnh mẽ, phù hợp cho mọi nhu cầu.",
            'price' => $this->faker->numberBetween(10, 50) * 1000000, // Giá từ 10tr - 50tr
            'category_id' => ProductCategory::inRandomOrder()->first()->category_id ?? 1,
            'image_url' => '/images/laptops/default.jpg', // Hoặc link ảnh mẫu
            'stock_quantity' => $this->faker->numberBetween(0, 50),
            'rating' => $this->faker->randomFloat(2, 3, 5),
            'views' => $this->faker->numberBetween(100, 5000),
        ];
    }
}