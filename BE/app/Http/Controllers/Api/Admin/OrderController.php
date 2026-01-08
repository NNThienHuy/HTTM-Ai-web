<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        // Trả về danh sách đơn hàng
        return response()->json(Order::with('customer.account')->orderBy('created_at', 'desc')->get());
    }

    public function show($id)
    {
        $order = Order::with('items.product')->find($id);
        if (!$order) return response()->json(['error' => 'Not found'], 404);
        
        // MAPPING DỮ LIỆU ĐẦY ĐỦ CHO FE
        // FE dùng các trường: adress (lưu ý chính tả FE), city, country, postalCode...
        // Nếu DB của bạn chưa có các cột này, ta trả về chuỗi rỗng để FE không bị lỗi.
        
        return response()->json([
            'id' => $order->order_id,
            'name' => $order->customer_name, 
            'lastname' => '', // FE cần lastname, nếu không có thì để rỗng
            'email' => $order->customer_email,
            'phone' => $order->customer_phone,
            'adress' => $order->shipping_address, // FE viết sai chính tả là 'adress', BE phải theo
            'apartment' => '', // DB chưa có
            'company' => '',   // DB chưa có
            'city' => $order->shipping_city ?? '', // Lấy từ DB nếu có
            'country' => 'Vietnam', // Mặc định
            'postalCode' => '',
            'dateTime' => $order->created_at->format('Y-m-d H:i:s'),
            'status' => $order->status, // processing, delivered, canceled
            'total' => $order->total_amount,
            'orderNotice' => $order->note,
        ]);
    }

    public function update(Request $request, $id)
    {
        $order = Order::find($id);
        if (!$order) return response()->json(['error' => 'Not found'], 404);

        // FE gửi lên rất nhiều trường, nhưng ta chỉ cần update status và các thông tin cơ bản
        $order->status = $request->status;
        $order->customer_name = $request->name . ' ' . $request->lastname;
        $order->customer_phone = $request->phone;
        $order->shipping_address = $request->adress; // FE gửi 'adress'
        $order->note = $request->orderNotice;
        
        // Lưu các trường khác nếu DB bạn có hỗ trợ (city, district...)
        
        $order->save();

        return response()->json($order);
    }

    // ... Các hàm getOrderProducts, destroy, deleteOrderProducts giữ nguyên như cũ
    public function getOrderProducts($orderId)
    {
        $items = OrderItem::with('product')->where('order_id', $orderId)->get();
        return response()->json($items);
    }

    public function destroy($id)
    {
        Order::destroy($id);
        return response()->json(null, 204);
    }
    
    public function deleteOrderProducts($id) {
         OrderItem::where('order_id', $id)->delete();
         return response()->json(null, 204);
    }
}