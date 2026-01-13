<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    // 1. LẤY DANH SÁCH ĐƠN HÀNG
    // Route: GET /api/admin/orders
    public function index(Request $request)
    {
        // Load quan hệ 'customer' để phòng trường hợp order.customer_name bị null
        $orders = Order::with('customer')
            ->orderBy('created_at', 'desc')
            ->get();

        // Xử lý dữ liệu (nếu cần) để đảm bảo không bị null
        $orders->transform(function ($order) {
            // Nếu bảng orders chưa lưu tên, lấy từ bảng customer
            if (empty($order->customer_name) && $order->customer) {
                $order->customer_name = $order->customer->last_name . ' ' . $order->customer->first_name;
            }
            if (empty($order->customer_email) && $order->customer) {
                $order->customer_email = $order->customer->email;
            }
            return $order;
        });

        return response()->json($orders);
    }

    // 2. CHI TIẾT ĐƠN HÀNG
    // Route: GET /api/admin/orders/{id}
    public function show($id)
    {
        // Tìm theo order_id (khóa chính)
        $order = Order::with('customer')->find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        // Fallback dữ liệu nếu trong bảng orders bị thiếu
        if (empty($order->customer_name) && $order->customer) {
            $order->customer_name = $order->customer->last_name . ' ' . $order->customer->first_name;
        }
        if (empty($order->customer_phone) && $order->customer) {
            $order->customer_phone = $order->customer->phone_number;
        }

        return response()->json($order);
    }

    // 3. CẬP NHẬT ĐƠN HÀNG
    // Route: PUT /api/admin/orders/{id}
    public function update(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        // Validate dữ liệu cơ bản
        $request->validate([
            'status' => 'required',
        ]);

        // Cập nhật các trường cho phép
        $order->status = $request->status;
        $order->note = $request->note; // Ghi chú đơn hàng
        
        // Cập nhật thông tin giao hàng nếu có gửi lên
        if ($request->has('shipping_address')) {
            $order->shipping_address = $request->shipping_address;
        }
        if ($request->has('shipping_city')) {
            $order->shipping_city = $request->shipping_city;
        }
        
        // Cập nhật thông tin khách (tùy chọn, thường ít khi sửa tên khách ở đơn hàng)
        if ($request->has('customer_name')) {
            $order->customer_name = $request->customer_name;
        }
        if ($request->has('customer_phone')) {
            $order->customer_phone = $request->customer_phone;
        }

        $order->save();

        return response()->json(['message' => 'Update successful', 'order' => $order]);
    }

    // 4. LẤY SẢN PHẨM TRONG ĐƠN (QUAN TRỌNG)
    // Route: GET /api/admin/order-product/{id}
    public function getOrderProducts($orderId)
    {
        // Load 'product' để FE lấy được tên, ảnh, slug...
        $items = OrderItem::with('product')
            ->where('order_id', $orderId)
            ->get();

        return response()->json($items);
    }

    // 5. XÓA ĐƠN HÀNG
    // Route: DELETE /api/admin/orders/{id}
    public function destroy($id)
    {
        $order = Order::find($id);
        if ($order) {
            // Xóa các item con trước (nếu chưa thiết lập cascade delete trong DB)
            OrderItem::where('order_id', $id)->delete();
            $order->delete();
            return response()->json(['message' => 'Deleted successfully'], 200);
        }
        return response()->json(['message' => 'Not found'], 404);
    }

    // 6. XÓA SẢN PHẨM TRONG ĐƠN (Dùng khi FE gọi xóa item trước khi xóa order)
    // Route: DELETE /api/admin/order-product/{orderId}
    public function deleteOrderProducts($orderId)
    {
        OrderItem::where('order_id', $orderId)->delete();
        return response()->json(['message' => 'Order items deleted'], 200);
    }
}