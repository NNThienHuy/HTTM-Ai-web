<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category; // <-- 1. IMPORT Model Category
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Lấy danh sách TẤT CẢ danh mục.
     * Tương ứng với route: GET /api/categories
     */
    public function index()
    {
        // Lấy tất cả danh mục, kèm theo danh mục con (children)
        $categories = Category::with('children')->whereNull('parent_id')->get();
        // whereNull('parent_id') chỉ lấy các danh mục GỐC (cha)

        return response()->json($categories);
    }

    /**
     * Lấy thông tin chi tiết MỘT danh mục.
     * Tương ứng với route: GET /api/categories/{category}
     */
    public function show(Category $category)
    {
        // Tải thêm thông tin danh mục con (nếu có)
        // và tải 10 sản phẩm ĐẦU TIÊN thuộc danh mục này
        $category->load(['children', 'products' => function ($query) {
            $query->limit(10);
        }]);

        return response()->json($category);
    }

    /**
     * (Hàm store, update, destroy chúng ta sẽ để cho Admin làm)
     */
}