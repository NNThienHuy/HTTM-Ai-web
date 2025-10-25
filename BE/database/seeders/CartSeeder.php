<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Cart;

class CartSeeder extends Seeder
{
    public function run(): void
    {
        // Đảm bảo có sẵn một lượng product (nếu đã có rồi thì có thể bỏ đoạn này)
        if (Product::count() < 20) {
            // Cần ProductFactory nếu chạy nhánh này
            Product::factory(50)->create();
        }

        // Tạo 20 carts; mỗi cart sẽ tự sinh 1-5 CartItem (nhờ configure() trong CartFactory)
        Cart::factory(20)->create();
    }
}
