<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\UserProductInteraction;
use App\Models\Customer;
use App\Models\Product;

class InteractionSeeder extends Seeder {
    public function run()
    {
    $customers = \App\Models\Customer::all();
    $products = \App\Models\Product::all();

    if ($products->count() < 10) return;

    foreach ($customers as $index => $cus) {
        // Nhóm 1: Thích đồ Gaming (Sản phẩm ID 1 đến 5)
        if ($index % 2 == 0) {
            $targetProds = $products->whereIn('product_id', [1, 2, 3, 4, 5]);
        } 
        // Nhóm 2: Thích đồ Văn phòng (Sản phẩm ID 6 đến 10)
        else {
            $targetProds = $products->whereIn('product_id', [6, 7, 8, 9, 10]);
        }

        foreach ($targetProds as $prod) {
            \App\Models\UserProductInteraction::create([
                'customer_id' => $cus->customer_id,
                'product_id' => $prod->product_id,
                'interaction_type' => $index % 3 == 0 ? 'purchase' : 'view',
                'interaction_value' => 1.0
                ]);
            }
        }
    }
}