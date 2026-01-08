<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProductReview;
use App\Models\Customer;
use App\Models\Product;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $customers = Customer::all();
        $products = Product::all();
        $comments = [
            'Sản phẩm tuyệt vời, giao hàng nhanh.',
            'Máy dùng mượt, rất phù hợp cho dân đồ họa.',
            'Tốt trong tầm giá, nhân viên tư vấn nhiệt tình.',
            'Cấu hình mạnh mẽ, thiết kế rất sang trọng.'
        ];

        foreach ($products as $product) {
            // Mỗi sản phẩm có 2-3 đánh giá ngẫu nhiên
            for ($i = 0; $i < rand(2, 3); $i++) {
                ProductReview::create([
                    'product_id' => $product->product_id,
                    'customer_id' => $customers->random()->customer_id,
                    'rating' => rand(4, 5), // Đánh giá 4-5 sao
                    'comment' => $comments[array_rand($comments)],
                ]);
            }
        }
    }
}