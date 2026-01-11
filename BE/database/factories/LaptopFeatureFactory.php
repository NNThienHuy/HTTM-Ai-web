<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Product;

class LaptopFeatureFactory extends Factory
{
    public function definition(): array
    {
        // Random cấu hình cho giống thật
        return [
            // Product ID sẽ được gán lúc gọi factory này từ ProductFactory
            'brand' => $this->faker->randomElement(['Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Apple', 'MSI']),
            'processor' => $this->faker->randomElement(['Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Apple M1', 'Apple M2']),
            'ram' => $this->faker->randomElement([8, 16, 32, 64]),
            'storage' => $this->faker->randomElement([256, 512, 1024, 2048]),
            'screen_size' => $this->faker->randomElement([13.3, 14.0, 15.6, 16.0, 17.3]),
            'gpu' => $this->faker->randomElement(['NVIDIA RTX 3050', 'NVIDIA RTX 4060', 'Integrated Graphics', 'AMD Radeon']),
            'price_range' => $this->faker->randomElement(['budget', 'mid-range', 'premium']),
            'weight' => $this->faker->randomFloat(2, 1.0, 3.5), // 1kg đến 3.5kg
            'battery_life' => $this->faker->numberBetween(4, 12),
            'purpose' => $this->faker->randomElement(['Gaming', 'Office', 'Student', 'Graphic Design']),
        ];
    }
}