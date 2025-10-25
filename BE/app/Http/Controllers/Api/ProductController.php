<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str; // Import Str facade để tạo slug

class ProductController extends Controller
{
    /**
     * Lấy danh sách TẤT CẢ sản phẩm (cho Admin).
     * Tương ứng với route: GET /api/admin/products
     */
    public function index(Request $request)
    {
        // Thêm filter và search nếu cần
        $products = Product::with(['category', 'brand','images','reviews'])
                            ->orderBy('created_at', 'desc')
                            ->paginate(20);

        return response()->json($products);
    }

    /**
     * Tạo một sản phẩm mới.
     * Tương ứng với route: POST /api/admin/products
     */
    public function store(Request $request)
    {
        // 1. Validate dữ liệu
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'required|exists:brands,id',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive,out_of_stock',
            // Thêm các trường khác nếu cần
        ]);

        // 2. Tự động tạo slug từ name
        $data['slug'] = Str::slug($data['name']) . '-' . uniqid();

        // 3. Tạo sản phẩm
        $product = Product::create($data);

        return response()->json($product, 201); // 201 = Created
    }

    /**
     * Lấy chi tiết MỘT sản phẩm (cho Admin).
     * Tương ứng với route: GET /api/admin/products/{product}
     */
    public function show(Product $product)
    {
        // Admin có thể cần xem mọi thứ
        $product->load(['images', 'reviews', 'specifications', 'category', 'brand']);
        return response()->json($product);
    }

    /**
     * Cập nhật một sản phẩm.
     * Tương ứng với route: PUT /api/admin/products/{product}
     */
    public function update(Request $request, Product $product)
    {
        // 1. Validate
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category_id' => 'sometimes|required|exists:categories,id',
            'brand_id' => 'sometimes|required|exists:brands,id',
            'price' => 'sometimes|required|numeric|min:0',
            'stock_quantity' => 'sometimes|required|integer|min:0',
            'description' => 'nullable|string',
            'status' => 'sometimes|required|in:active,inactive,out_of_stock',
        ]);

        // 2. Cập nhật slug nếu tên sản phẩm thay đổi
        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']) . '-' . $product->id; // Dùng ID để slug không bị trùng
        }

        // 3. Cập nhật sản phẩm
        $product->update($data);

        return response()->json($product);
    }

    /**
     * Xóa một sản phẩm.
     * Tương ứng với route: DELETE /api/admin/products/{product}
     */
    public function destroy(Product $product)
    {
        $product->delete();

        // Trả về 204 No Content, nghĩa là "đã xóa thành công"
        return response()->json(null, 204);
    }
}