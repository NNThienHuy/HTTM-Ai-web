<?php

namespace Database\Seeders; // Cực kỳ quan trọng: Phải có dòng này

use Illuminate\Database\Seeder;
use App\Models\UserProductInteraction;
use App\Models\Customer;
use App\Models\Product;

class RandomInteractionSeeder extends Seeder
{
    public function run(): void
    {
        $customers = Customer::all();
        $products = Product::all();
        $types = ['view', 'cart', 'purchase'];

        if ($customers->isEmpty() || $products->isEmpty()) {
            return;
        }

        foreach ($customers as $customer) {
            // Lấy ngẫu nhiên từ 3 đến 5 sản phẩm
            $randomProducts = $products->random(min(5, $products->count()));

            foreach ($randomProducts as $product) {
                UserProductInteraction::create([
                    'customer_id' => $customer->customer_id,
                    'product_id' => $product->product_id,
                    'interaction_type' => $types[array_rand($types)],
                    'interaction_value' => 1.0,
                ]);
            }
        }
    }
}