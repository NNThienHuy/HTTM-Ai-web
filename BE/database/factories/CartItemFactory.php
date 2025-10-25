<?php

namespace Database\Factories;

use App\Models\CartItem;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class CartItemFactory extends Factory
{
    protected $model = CartItem::class;

    public function definition(): array
    {
        return [
            // Cho phép dùng độc lập (sẽ tạo Cart mới nếu không truyền cart_id)
            'cart_id'    => Cart::factory(),
            // Lấy 1 product có sẵn; nếu chưa có product nào thì tạo mới (cần ProductFactory nếu rơi vào nhánh create)
            'product_id' => function () {
                $id = Product::query()->inRandomOrder()->value('id');
                return $id ?? Product::factory()->create()->id;
            },
            'quantity'   => $this->faker->numberBetween(1, 4),
        ];
    }
}
