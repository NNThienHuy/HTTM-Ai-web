<?php

namespace Database\Factories;

use App\Models\Cart;
use App\Models\User;
use App\Models\CartItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class CartFactory extends Factory
{
    protected $model = Cart::class;

    public function definition(): array
    {
        return [
            // Cart của 1 user ngẫu nhiên (tạo mới user nếu chưa có)
            'user_id' => User::factory(),
            // Nếu bảng có cột notes thì giữ lại, không có có thể xoá dòng dưới
            'notes'   => $this->faker->optional()->sentence(),
        ];
    }

    /**
     * Sau khi tạo Cart thì tự động sinh 1-5 CartItem thuộc về Cart này
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Cart $cart) {
            CartItem::factory()
                ->count($this->faker->numberBetween(1, 5))
                ->create([
                    'cart_id' => $cart->id, // gắn item vào cart vừa tạo
                ]);
        });
    }
}
