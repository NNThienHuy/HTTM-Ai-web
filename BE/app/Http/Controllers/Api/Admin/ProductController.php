<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Product, LaptopFeature};
use Illuminate\Http\Request;

class AdminProductController extends Controller {
    public function store(Request $request) {
        return \DB::transaction(function () use ($request) {
            $product = Product::create($request->only(['name', 'description', 'price', 'category_id', 'stock_quantity']));
            
            // Lưu thông số kỹ thuật (Bảng 16)
            LaptopFeature::create(array_merge($request->get('features'), ['product_id' => $product->product_id]));
            
            return response()->json(['message' => 'Thêm sản phẩm thành công'], 201);
        });
    }

    public function updateStatus(Request $request, $id) {
        $product = Product::findOrFail($id);
        $product->update($request->only('status'));
        return response()->json(['message' => 'Cập nhật trạng thái thành công']);
    }
}