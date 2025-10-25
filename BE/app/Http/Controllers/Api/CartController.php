<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    /**
     * Lấy hoặc tạo giỏ hàng cho user đang đăng nhập.
     */
    private function getOrCreateCart(Request $request)
    {
        // Lấy user đang đăng nhập
        $user = $request->user();

        // Tìm giỏ hàng của user, nếu không có thì tạo mới
        // firstOrCreate() = Tìm, nếu không thấy thì Tạo
        $cart = Cart::firstOrCreate(
            ['user_id' => $user->id]
        );

        return $cart;
    }

    /**
     * Lấy chi tiết giỏ hàng của user.
     * Tương ứng với route: GET /api/cart
     */
    public function show(Request $request)
    {
        $cart = $this->getOrCreateCart($request);
        
        // Tải thông tin các món hàng (items) và chi tiết sản phẩm (product)
        $cart->load('items.product');

        return response()->json($cart);
    }

    /**
     * Thêm sản phẩm vào giỏ hàng.
     * Tương ứng với route: POST /api/cart/items
     */
    public function addItem(Request $request)
    {
        // 1. Validate dữ liệu
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = $this->getOrCreateCart($request);
        $productId = $data['product_id'];
        $quantity = $data['quantity'];

        // 2. Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        $cartItem = $cart->items()->where('product_id', $productId)->first();

        if ($cartItem) {
            // Nếu đã có, cộng dồn số lượng
            $cartItem->quantity += $quantity;
            $cartItem->save();
        } else {
            // Nếu chưa có, tạo mới
            $cartItem = new CartItem([
                'product_id' => $productId,
                'quantity' => $quantity,
            ]);
            $cart->items()->save($cartItem);
        }
        
        // Trả về giỏ hàng đã cập nhật
        $cart->load('items.product');
        return response()->json($cart);
    }

    /**
     * Cập nhật số lượng của một món hàng trong giỏ.
     */
    public function updateItem(Request $request, CartItem $cartItem)
    {
        // 1. Validate
        $data = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        // 2. Kiểm tra quyền: Món hàng này có thuộc giỏ hàng của user không?
        $cart = $this->getOrCreateCart($request);
        if ($cartItem->cart_id !== $cart->id) {
            return response()->json(['message' => 'Không có quyền truy cập.'], 403); // 403 = Forbidden
        }

        // 3. Cập nhật số lượng
        $cartItem->quantity = $data['quantity'];
        $cartItem->save();

        $cart->load('items.product');
        return response()->json($cart);
    }

    /**
     * Xóa một món hàng khỏi giỏ hàng.
     */
    public function removeItem(Request $request, CartItem $cartItem)
    {
        // 1. Kiểm tra quyền
        $cart = $this->getOrCreateCart($request);
        if ($cartItem->cart_id !== $cart->id) {
            return response()->json(['message' => 'Không có quyền truy cập.'], 403);
        }

        // 2. Xóa
        $cartItem->delete();
        
        $cart->load('items.product');
        return response()->json($cart);
    }
}