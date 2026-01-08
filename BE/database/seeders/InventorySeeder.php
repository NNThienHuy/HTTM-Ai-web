<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryItem; // Tên bảng 13 của bạn là inventoru_items_table (có thể sai chính tả, hãy check lại model)
use App\Models\Product;
use App\Models\Warehouse;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all();
        $warehouses = Warehouse::all();

        if ($warehouses->isEmpty()) return;

        foreach ($products as $product) {
            InventoryItem::create([
                'product_id' => $product->product_id,
                'warehouse_id' => $warehouses->random()->warehouse_id,
                'quantity' => rand(10, 50),
            ]);
        }
    }
}