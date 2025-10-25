<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Cart;
use App\Services\VnpayService; // <-- Import
use Illuminate\Support\Facades\Log; // <-- Import

class PaymentController extends Controller
{
    /**
     * Xử lý callback (IPN) từ VNPAY
     */
    public function vnpayCallback(Request $request, VnpayService $vnpayService)
    {
        // 1. Xác thực chữ ký
        $isVerified = $vnpayService->verifyCallback($request);

        // 2. Nếu chữ ký hợp lệ VÀ giao dịch thành công
        if ($isVerified && $request->vnp_ResponseCode == '00') {
            
            // 3. Lấy ID đơn hàng
            $orderId = $request->vnp_TxnRef;
            
            $order = Order::find($orderId);
            
            // 4. Kiểm tra xem đơn hàng có tồn tại và đang 'pending' không
            if ($order && $order->payment_status === 'pending') {
                
                // 5. Cập nhật trạng thái thanh toán
                $order->payment_status = 'paid'; // 'paid' = đã thanh toán
                $order->save();
                
                // 6. XÓA GIỎ HÀNG (vì giờ mới chắc chắn đã thanh toán)
                $cart = Cart::where('user_id', $order->user_id)->first();
                if ($cart) {
                    $cart->items()->delete();
                }
                
                // 7. Ghi log thành công
                Log::info('VNPAY Payment Success', ['order_id' => $orderId, 'data' => $request->all()]);
                
                // (Sau này, bạn sẽ đổi VNPAY_RETURNURL thành link Frontend)
                // return redirect('http://my-frontend.com/payment/success');
                return response()->json(['message' => 'Payment successful'], 200);
            }
            
            Log::warning('VNPAY Callback: Order not found or already processed', ['data' => $request->all()]);
        }
        
        // (Thanh toán thất bại hoặc chữ ký không hợp lệ)
        Log::error('VNPAY Callback Failed', ['data' => $request->all()]);
        // return redirect('http://my-frontend.com/payment/failed');
        return response()->json(['message' => 'Payment failed or invalid signature'], 400);
    }

    /**
     * Xử lý callback (IPN) từ MOMO (Để trống nếu bạn không dùng)
     */
    public function momoCallback(Request $request)
    {
        // ...
    }
}