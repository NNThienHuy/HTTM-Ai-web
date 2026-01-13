<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\UserProductInteraction;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function getCart(Request $request)
    {
        $customer = $request->user()->customer;
        $cart = Cart::with(['items.product.laptopFeature'])
            ->where('customer_id', $customer->customer_id)
            ->first();

        if (!$cart) {
            $cart = Cart::create([
                'customer_id' => $customer->customer_id,
                'total_amount' => 0
            ]);
        }

        return response()->json([
            'success' => true,
            'cart' => $cart
        ]);
    }

    public function addItem(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,product_id',
            'quantity' => 'required|integer|min:1'
        ]);

        $customer = $request->user()->customer;
        $cart = Cart::firstOrCreate(
            ['customer_id' => $customer->customer_id],
            ['total_amount' => 0]
        );

        $product = Product::findOrFail($validated['product_id']);

        if ($product->stock_quantity < $validated['quantity']) {
            return response()->json([
                'success' => false,
                'message' => 'Not enough stock available'
            ], 400);
        }

        $cartItem = CartItem::where('cart_id', $cart->cart_id)
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($cartItem) {
            $cartItem->quantity += $validated['quantity'];
            $cartItem->subtotal = $cartItem->quantity * $cartItem->price;
            $cartItem->save();
        } else {
            CartItem::create([
                'cart_id' => $cart->cart_id,
                'product_id' => $validated['product_id'],
                'quantity' => $validated['quantity'],
                'price' => $product->price,
                'subtotal' => $product->price * $validated['quantity']
            ]);
        }

        UserProductInteraction::create([
            'customer_id' => $customer->customer_id,
            'product_id' => $validated['product_id'],
            'interaction_type' => 'cart',
            'interaction_value' => 3.0
        ]);

        $cart->calculateTotal();

        return response()->json([
            'success' => true,
            'message' => 'Item added to cart',
            'cart' => $cart->load('items.product')
        ]);
    }

    public function updateItem(Request $request, string $cartItemId)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $cartItem = CartItem::findOrFail($cartItemId);
        $product = $cartItem->product;

        if ($product->stock_quantity < $validated['quantity']) {
            return response()->json([
                'success' => false,
                'message' => 'Not enough stock available'
            ], 400);
        }

        $cartItem->quantity = $validated['quantity'];
        $cartItem->subtotal = $cartItem->quantity * $cartItem->price;
        $cartItem->save();

        $cartItem->cart->calculateTotal();

        return response()->json([
            'success' => true,
            'message' => 'Cart updated',
            'cart' => $cartItem->cart->load('items.product')
        ]);
    }

    public function removeItem(Request $request, string $cartItemId)
    {
        $cartItem = CartItem::findOrFail($cartItemId);
        $cart = $cartItem->cart;
        
        $cartItem->delete();
        $cart->calculateTotal();

        return response()->json([
            'success' => true,
            'message' => 'Item removed',
            'cart' => $cart->load('items.product')
        ]);
    }

    public function clearCart(Request $request)
    {
        $customer = $request->user()->customer;
        $cart = Cart::where('customer_id', $customer->customer_id)->first();

        if ($cart) {
            $cart->items()->delete();
            $cart->total_amount = 0;
            $cart->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared',
            'cart' => $cart
        ]);
    }
}