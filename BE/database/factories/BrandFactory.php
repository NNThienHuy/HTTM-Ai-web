<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class BrandFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->company(), // Ví dụ: "Apple", "Samsung"
            'logo_url' => fake()->imageUrl(300, 300, 'business'),
        ];
    }
}