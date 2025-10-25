<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Lấy danh sách TẤT CẢ đơn hàng trên hệ thống.
     */
    public function index(Request $request)
    {
        // Admin có thể filter theo trạng thái, ví dụ: /api/admin/orders?status=pending
        $query = Order::with('user'); 

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($orders);
    }

    /**
     * Lấy chi tiết MỘT đơn hàng bất kỳ.
     */
    public function show(Order $order)
    {
        // Tải tất cả thông tin liên quan
        $order->load(['user', 'items.product']);
        
        return response()->json($order);
    }

    /**
     * Cập nhật TRẠNG THÁI của một đơn hàng.
     */
    public function update(Request $request, Order $order)
    {
        // Admin chỉ nên cập nhật trạng thái
        $data = $request->validate([
            'status' => 'required|in:pending,processing,shipped,completed,cancelled',
            'payment_status' => 'required|in:pending,paid,failed',
        ]);

        $order->update($data);

        $order->load(['user', 'items.product']);
        return response()->json($order);
    }

    public function destroy(Order $order)
    {
        return response()->json(['message' => 'Không được phép xóa đơn hàng.'], 403);
    }
}