<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CategoryFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true); // Ví dụ: "Điện Thoại"
        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'parent_id' => null, // Mặc định là danh mục cha
        ];
    }
}