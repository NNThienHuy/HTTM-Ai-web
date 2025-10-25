<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; //1. IMPORT DB ĐỂ DÙNG TRANSACTION
use App\Services\VnpayService; // <-- THÊM DÒNG NÀY
class OrderController extends Controller
{
    /**
     * Lấy lịch sử đơn hàng của user đang đăng nhập.
     * Tương ứng với route: GET /api/orders
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Lấy các đơn hàng của user, sắp xếp mới nhất lên đầu, và phân trang
        $orders = Order::where('user_id', $user->id)
                        ->orderBy('created_at', 'desc')
                        ->paginate(15);

        return response()->json($orders);
    }

    /**
     * Xem chi tiết MỘT đơn hàng.
     * Tương ứng với route: GET /api/orders/{order}
     */
    public function show(Request $request, Order $order)
    {
        $user = $request->user();

        // Kiểm tra quyền truy cập của người dùng
        if ($order->user_id !== $user->id) {
            return response()->json(['message' => 'Không có quyền truy cập.'], 403);
        }

        // Tải chi tiết các món hàng (items) và sản phẩm (product)
        $order->load('items.product');

        return response()->json($order);
    }

    /**
     * Tạo đơn hàng mới (Checkout).
     * Tương ứng với route: POST /api/orders
     */
    /**
     * Tạo đơn hàng mới (Checkout).
     * Tương ứng với route: POST /api/orders
     */
    public function store(Request $request, VnpayService $vnpayService) // <-- Tiêm VnpayService vào
    {
        $user = $request->user();

        // 1. Validate
        $data = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'shipping_address' => 'required|string',
            'payment_method' => 'required|string|in:COD,VNPAY', // Thêm 'VNPAY'
        ]);

        // 2. Lấy giỏ hàng
        $cart = Cart::with('items.product')->where('user_id', $user->id)->first();
        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'Giỏ hàng của bạn đang rỗng.'], 400); 
        }

        // 3. Tính tổng tiền
        $totalAmount = 0;
        foreach ($cart->items as $item) {
            $price = $item->product->sale_price ?? $item->product->price;
            $totalAmount += $price * $item->quantity;
        }

        // 4. Tạo đơn hàng (luôn tạo trước)
        $order = Order::create([
            'user_id' => $user->id,
            'customer_name' => $data['customer_name'],
            'customer_email' => $data['customer_email'],
            'customer_phone' => $data['customer_phone'],
            'shipping_address' => $data['shipping_address'],
            'payment_method' => $data['payment_method'],
            'total_amount' => $totalAmount,
            'status' => 'pending', 
            'payment_status' => 'pending', 
        ]);
        
        // 5. Xử lý thanh toán

        // A. NẾU LÀ COD
        if ($data['payment_method'] === 'COD') {
            DB::transaction(function () use ($cart, $order) {
                // Sao chép CartItem sang OrderItem
                foreach ($cart->items as $item) {
                    $price = $item->product->sale_price ?? $item->product->price;
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item->product_id,
                        'quantity' => $item->quantity,
                        'price' => $price, 
                    ]);
                }
                // Xóa giỏ hàng
                $cart->items()->delete();
            });
            
            $order->load('items.product');
            return response()->json($order, 201); 
        }

        // B. NẾU LÀ VNPAY
        if ($data['payment_method'] === 'VNPAY') {
            // Sao chép CartItem sang OrderItem (nhưng chưa xóa giỏ)
            foreach ($cart->items as $item) {
                $price = $item->product->sale_price ?? $item->product->price;
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $price, 
                ]);
            }
            
            // Gọi VnpayService để lấy URL
            $payment_url = $vnpayService->createPaymentUrl($order, $request);

            if ($payment_url) {
                // Trả URL về cho Frontend
                return response()->json([
                    'payment_url' => $payment_url
                ]);
            } else {
                // Nếu gọi VnPay thất bại
                $order->delete(); // Xóa đơn hàng vừa tạo
                return response()->json(['message' => 'Không thể tạo yêu cầu thanh toán VnPay.'], 500);
            }
        }
    }
}