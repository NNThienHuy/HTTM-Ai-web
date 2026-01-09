<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    // 1. Lấy danh sách đơn hàng
    public function index(Request $request)
    {
        $user = $request->user();
        
        // --- SỬA LẠI: Không dùng account_id nếu bảng không có ---
        // Thử tìm theo customer_email trước vì nó chắc chắn tồn tại trong bảng orders
        $orders = Order::where('customer_email', $user->email)
                       ->orderBy('created_at', 'desc')
                       ->get();
                       
        return response()->json($orders);
    }

    // 2. Tạo đơn hàng mới
public function store(Request $request)
    {
        try {
            // Validate dữ liệu
            $validated = $request->validate([
                'customer_name' => 'required|string',
                'customer_phone' => 'required|string',
                'customer_email' => 'required|email',
                'shipping_address' => 'required|string',
                'total_amount' => 'required|numeric',
                'user_id' => 'nullable', 
                'order_notes' => 'nullable|string',
                // 'payment_method' => 'nullable|string' // Tạm bỏ validate này
            ]);

            $order = new Order();
            
            // 1. Gán Customer ID (Đã fix từ bước trước)
            $order->customer_id = $request->user_id; 
            
            // 2. Gán thông tin người nhận
            $order->customer_name = $request->customer_name;
            $order->customer_phone = $request->customer_phone;
            $order->customer_email = $request->customer_email;
            $order->shipping_address = $request->shipping_address;
            $order->total_amount = $request->total_amount;
            $order->status = 'pending';
            
            // 3. [QUAN TRỌNG] Sửa lỗi cột ghi chú
            // DB của bạn tên cột là 'note', nhưng Frontend gửi lên là 'order_notes'
            $order->note = $request->order_notes; 

            // 4. [QUAN TRỌNG] Sửa lỗi Payment Method
            // Vì DB chưa có cột 'payment_method', ta tạm thời KHÔNG lưu dòng này
            // $order->payment_method = $request->payment_method ?? 'COD'; 
            
            $order->save();

            return response()->json([
                'message' => 'Order created successfully',
                'id' => $order->order_id, 
                'order' => $order
            ], 201);

        } catch (\Exception $e) {
            Log::error("Create Order Error: " . $e->getMessage());
            return response()->json(['message' => 'Database Error: ' . $e->getMessage()], 500);
        }
    }
    // 3. Thêm sản phẩm
    public function addProduct(Request $request)
    {
        try {
            // Bạn nên đổi tên param này từ Frontend cho thống nhất, nhưng hiện tại giữ nguyên
            $orderId = $request->customerOrderId ?? $request->order_id;

            // Kiểm tra xem bảng trong DB là 'order_details' hay 'order_items'
            // Nếu lỗi "Table 'order_details' doesn't exist", hãy đổi tên bảng ở dưới
            DB::table('order_details')->insert([
                'order_id' => $orderId,
                'product_id' => $request->product_id ?? $request->productId, // Hỗ trợ cả 2 cách gọi
                'quantity' => $request->quantity,
                'price' => $request->price ?? 0,
            ]);

            return response()->json(['message' => 'Product added']);

        } catch (\Exception $e) {
            Log::error("Add Product Error: " . $e->getMessage());
            return response()->json(['message' => 'Add Product Error: ' . $e->getMessage()], 500); 
        }
    }
    
    public function show($id)
    {
        // Hàm này sẽ lỗi nếu Model Order chưa có function details()
        // Nếu lỗi, tạm thời bỏ ->with('details')
        $order = Order::with('details')->find($id); 
        
        if (!$order) return response()->json(['message' => 'Not found'], 404);
        return response()->json($order);
    }
}