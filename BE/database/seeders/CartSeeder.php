<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Customer;
use App\Models\Product;

class CartSeeder extends Seeder
{
    public function run(): void
    {
        $customers = Customer::all();
        $products = Product::all();

        foreach ($customers as $customer) {
            $cart = Cart::create(['customer_id' => $customer->customer_id]);
            
            // Random 1 sản phẩm đang nằm trong giỏ
            $product = $products->random();
            CartItem::create([
                'cart_id' => $cart->cart_id,
                'product_id' => $product->product_id,
                'quantity' => 1,
            ]);
        }
    }
}