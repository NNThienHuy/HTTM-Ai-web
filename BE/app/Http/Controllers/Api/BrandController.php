<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand; // <-- 1. IMPORT Model Brand
use Illuminate\Http\Request;

class BrandController extends Controller
{
    /**
     * Lấy danh sách TẤT CẢ thương hiệu.
     */
    public function index()
    {
        $brands = Brand::all(); // Lấy tất cả

        return response()->json($brands);
    }

    /**
     * Lấy thông tin chi tiết MỘT thương hiệu và các sản phẩm của nó.
     */
    public function show(Brand $brand)
    {
        // Tải 10 sản phẩm đầu tiên thuộc thương hiệu này
        $brand->load(['products' => function ($query) {
            $query->limit(10);
        }]);

        return response()->json($brand);
    }
}