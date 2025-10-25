<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = ucfirst($this->faker->unique()->words(3, true));

        // Tập cấu hình phần cứng
        $cpus = [
            'Intel Core i5-12400', 'Intel Core i7-12700',
            'Intel Core i5-13420H', 'Intel Core i7-13700H',
            'AMD Ryzen 5 5600H', 'AMD Ryzen 7 7735HS',
            'Apple M2', 'Apple M3'
        ];
        $rams = ['8GB DDR4','16GB DDR4','16GB DDR5','32GB DDR5'];
        $gpusDiscrete = ['NVIDIA GTX 1650','NVIDIA RTX 3050','NVIDIA RTX 4060 Laptop','AMD Radeon RX 6600M'];
        $gpusIntegrated = ['Intel Iris Xe','AMD Radeon 680M','Apple Integrated'];

        $cpu = $this->faker->randomElement($cpus);
        // Chọn GPU phù hợp CPU (Apple/Mobile -> integrated nhiều hơn)
        if (str_contains($cpu, 'Apple')) {
            $gpu = 'Apple Integrated';
        } elseif (str_contains($cpu, 'Intel')) {
            $gpu = $this->faker->randomElement(array_merge($gpusIntegrated, $gpusDiscrete));
        } else { // AMD
            $gpu = $this->faker->randomElement(array_merge($gpusIntegrated, $gpusDiscrete));
        }
        $ram = $this->faker->randomElement($rams);

        // Giá & tồn kho
        $price = $this->faker->numberBetween(7_000_00, 40_000_00); // 7–40 triệu (VNĐ, lưu DECIMAL theo đơn vị VNĐ)
        $hasSale = $this->faker->boolean(45);
        $salePrice = $hasSale ? max(0, $price - $this->faker->numberBetween(100_00, (int) round($price * 0.25))) : null;
        $qty = $this->faker->numberBetween(0, 200);

        return [
            'name'               => $name,
            'slug'               => Str::slug($name) . '-' . Str::random(6),
            'short_description'  => $this->faker->optional()->sentence(),
            'description'        => $this->faker->optional()->paragraph(),
            'price'              => $price,
            'sale_price'         => $salePrice,
            'stock_quantity'     => $qty,
            'sku'                => 'LAP-' . strtoupper(Str::random(10)),
            'thumbnail_url'      => $this->faker->imageUrl(800, 800, 'technics', true),
            'status'             => $qty === 0 ? 'out_of_stock' : 'active',
            'category_id'        => Category::query()->inRandomOrder()->value('id') ?? Category::factory(),
            'brand_id'           => Brand::query()->inRandomOrder()->value('id') ?? Brand::factory(),
            'cpu'                => $cpu,
            'ram'                => $ram,
            'gpu'                => $gpu,
        ];
    }

    // State tiện cho test
    public function gaming(): static
    {
        return $this->state(function () {
            return [
                'cpu' => $this->faker->randomElement(['Intel Core i7-13700H','Intel Core i7-12700','AMD Ryzen 7 7735HS']),
                'gpu' => $this->faker->randomElement(['NVIDIA RTX 4060 Laptop','NVIDIA RTX 3050']),
                'ram' => $this->faker->randomElement(['16GB DDR5','32GB DDR5']),
                'sale_price' => null,
            ];
        });
    }

    public function office(): static
    {
        return $this->state(function () {
            return [
                'cpu' => $this->faker->randomElement(['Intel Core i5-12400','Intel Core i5-13420H','Apple M2']),
                'gpu' => $this->faker->randomElement(['Intel Iris Xe','Apple Integrated']),
                'ram' => $this->faker->randomElement(['8GB DDR4','16GB DDR4']),
            ];
        });
    }
}
