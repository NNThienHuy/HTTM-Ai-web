<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; //1. IMPORT DB ĐỂ DÙNG TRANSACTION
use App\Services\VnpayService; // <-- THÊM DÒNG NÀYclass OrderController extends Controller
class OrderController extends Controller
{
    public function index(Request $request)
    {
        // LỖI 1: Trong hệ thống của bạn, Order liên kết với Customer, không phải User trực tiếp
        $customer = $request->user()->customer;

        if (!$customer) {
            return response()->json(['message' => 'Thông tin khách hàng không tồn tại.'], 404);
        }

        // LỖI 2: Đổi 'user_id' thành 'customer_id' để khớp với database
        $orders = Order::where('customer_id', $customer->customer_id)
                        ->orderBy('created_at', 'desc')
                        ->paginate(15);

        return response()->json($orders);
    }

    public function show(Request $request, Order $order)
    {
        $customer = $request->user()->customer;

        // LỖI 3: Kiểm tra quyền sở hữu dựa trên customer_id
        if ($order->customer_id !== $customer->customer_id) {
            return response()->json(['message' => 'Không có quyền truy cập.'], 403);
        }

        $order->load('items.product');

        return response()->json($order);
    }

    public function store(Request $request, VnpayService $vnpayService)
    {
        $user = $request->user();
        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['message' => 'Bạn cần cập nhật thông tin khách hàng trước.'], 400);
        }

        $data = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'shipping_address' => 'required|string',
            'payment_method' => 'required|string|in:COD,VNPAY',
        ]);

        // LỖI 4: Truy vấn giỏ hàng qua customer_id
        $cart = Cart::with('items.product')->where('customer_id', $customer->customer_id)->first();
        
        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'Giỏ hàng của bạn đang rỗng.'], 400); 
        }

        $totalAmount = 0;
        foreach ($cart->items as $item) {
            // LỖI 5: Đảm bảo lấy giá đúng tên cột 'price' của bảng products
            $price = $item->product->price; 
            $totalAmount += $price * $item->quantity;
        }

        // 4. Tạo đơn hàng (Dùng transaction bao bọc để an toàn)
        return DB::transaction(function () use ($customer, $data, $cart, $totalAmount, $vnpayService, $request) {
            $order = Order::create([
                'customer_id' => $customer->customer_id, // Đổi user_id -> customer_id
                'customer_name' => $data['customer_name'],
                'customer_email' => $data['customer_email'],
                'customer_phone' => $data['customer_phone'],
                'shipping_address' => $data['shipping_address'],
                'payment_method' => $data['payment_method'],
                'total_amount' => $totalAmount,
                'status' => 'pending', 
                'payment_status' => 'pending', 
            ]);

            // Copy sang OrderItem cho cả 2 phương thức
            foreach ($cart->items as $item) {
                OrderItem::create([
                    'order_id' => $order->order_id, // Dùng order_id của bảng 10
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->product->price, 
                ]);
            }

            if ($data['payment_method'] === 'COD') {
                $cart->items()->delete(); // Xóa giỏ ngay nếu là COD
                $cart->update(['total_amount' => 0]);
                
                return response()->json($order->load('items.product'), 201);
            }

            // Xử lý VNPAY
            $payment_url = $vnpayService->createPaymentUrl($order, $request);
            if (!$payment_url) {
                throw new \Exception('Không thể tạo URL thanh toán VnPay.');
            }

            return response()->json(['payment_url' => $payment_url]);
        });
    }
}