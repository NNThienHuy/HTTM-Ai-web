<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Customer;
use App\Models\Product;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $customers = Customer::all();
        $products = Product::all();

        foreach ($customers as $customer) {
            // Mỗi khách hàng có 1-2 đơn hàng
            for ($i = 0; $i < rand(1, 2); $i++) {
                $product = $products->random();
                $order = Order::create([
                    'customer_id' => $customer->customer_id,
                    'total_amount' => $product->price,
                    'status' => 'completed', // Đã hoàn thành
                    'order_date' => now()->subDays(rand(1, 30)),
                ]);

                OrderItem::create([
                    'order_id' => $order->order_id,
                    'product_id' => $product->product_id,
                    'quantity' => 1,
                    'price' => $product->price,
                ]);
            }
        }
    }
}