<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\LaptopFeature;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller {
    
    public function store(Request $request) {
        // Map dữ liệu từ Frontend sang Backend
        // FE: title, price, inStock, mainImage, description, slug, categoryId, merchantId, manufacturer
        
        $data = $request->validate([
            'title' => 'required',
            'price' => 'required|numeric',
            'categoryId' => 'required',
            'merchantId' => 'nullable', // Bổ sung merchant
            'slug' => 'required',
            'inStock' => 'required',
        ]);

        $productData = [
            'name' => $request->title,
            'description' => $request->description,
            'price' => $request->price,
            'category_id' => $request->categoryId,
            'merchant_id' => $request->merchantId, // Cần thêm cột này vào bảng products
            'image_url' => $request->mainImage,
            'stock_quantity' => $request->inStock,
            'rating' => 0,
            'views' => 0
        ];

        $product = Product::create($productData);
        
        // Tạo dummy feature nếu FE không gửi, để tránh lỗi
        LaptopFeature::create([
            'product_id' => $product->product_id,
            'brand' => $request->manufacturer ?? 'Generic',
            'processor' => 'N/A',
            'ram' => 8,
            'storage' => 256,
            'screen_size' => 15.6,
            'price_range' => 'mid-range',
            'weight' => 2.0,
            'battery_life' => 5
        ]);

        return response()->json($product, 201);
    }

    public function show($id) {
        $product = Product::with('laptopFeature')->find($id);
        if (!$product) return response()->json(['message' => 'Not found'], 404);
        
        // Map ngược lại để FE hiển thị đúng
        return response()->json([
            'id' => $product->product_id,
            'title' => $product->name,
            'slug' => Str::slug($product->name), // hoặc lưu slug trong db
            'price' => $product->price,
            'manufacturer' => $product->laptopFeature->brand ?? '',
            'description' => $product->description,
            'mainImage' => $product->image_url,
            'inStock' => $product->stock_quantity,
            'categoryId' => $product->category_id,
            'merchantId' => $product->merchant_id
        ]);
    }

    public function update(Request $request, $id) {
        $product = Product::find($id);
        if (!$product) return response()->json(['message' => 'Not found'], 404);

        $product->update([
            'name' => $request->title,
            'price' => $request->price,
            'description' => $request->description,
            'stock_quantity' => $request->inStock,
            'image_url' => $request->mainImage ?? $product->image_url,
            'category_id' => $request->categoryId,
        ]);

        return response()->json($product);
    }

    public function destroy($id) {
        $product = Product::find($id);
        if ($product) $product->delete();
        return response()->json(null, 204);
    }
}