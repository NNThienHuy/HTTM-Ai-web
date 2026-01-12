<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\UserProductInteraction;
use App\Services\HybridRecommendationService;
use Illuminate\Http\Request;
class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'laptopFeature']);

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $products = $query->paginate(12);

        return response()->json([
            'success' => true,
            'products' => $products
        ]);
    }

    public function show(
        Request $request, 
        string $productId,
        HybridRecommendationService $hybridService // Inject Service Hybrid
    ) {
        // 1. Lấy thông tin sản phẩm
        $product = Product::with(['category', 'laptopFeature', 'reviews.customer'])
            ->findOrFail($productId);

        // Tăng view
        $product->incrementViews();

        // 2. Ghi nhận tương tác View (để hệ thống học)
        if ($request->user() && $request->user()->customer) {
            UserProductInteraction::create([
                'customer_id' => $request->user()->customer->customer_id,
                'product_id' => $productId,
                'interaction_type' => 'view',
                'interaction_value' => 1.0
            ]);
        }

        // 3. CHẠY THUẬT TOÁN HYBRID
        // Lấy Customer ID (nếu chưa đăng nhập thì = 0)
        $customerId = $request->user()?->customer?->customer_id ?? 0;

        // Hàm này bên trong đã tự động kết hợp Content + Collaborative + Popularity
        $recommendations = $hybridService->getHybridRecommendations($product, $customerId, 8);

        // 4. Trả về JSON
        return response()->json([
            'success' => true,
            'product' => $product,
            
            // Trả về 1 danh sách duy nhất "Gợi ý thông minh"
            // Frontend hiển thị slider này là đủ
            'recommendations' => $recommendations
        ]);
    }

    public function getCategories()
    {
        $categories = ProductCategory::whereNull('parent_category_id')->get();

        return response()->json([
            'success' => true,
            'categories' => $categories
        ]);
    }
    public function search(Request $request)
    {
        $query = $request->get('q'); // Lấy từ khóa từ URL ?q=...

        if (!$query) {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        }

        // Sử dụng Scout để tìm kiếm
        // ->query(...): để Eager Load quan hệ (tránh lỗi N+1 và lấy được ảnh/giá)
        $products = Product::search($query)
            ->query(function ($builder) {
                $builder->with(['category', 'laptopFeature']);
            })
            ->take(20) // Giới hạn 20 kết quả tốt nhất
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }
}