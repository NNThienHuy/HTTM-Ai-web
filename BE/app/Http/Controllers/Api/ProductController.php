<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{

    public function index(Request $request)
    {
        $query = Product::query()
            ->with(['category', 'brand', 'images', 'reviews'])
            ->where('status', 'active')
            ->where('stock_quantity', '>', 0);

        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($brandId = $request->query('brand_id')) {
            $query->where('brand_id', $brandId);
        }

        if ($minPrice = $request->query('min_price')) {
            $query->where('price', '>=', $minPrice);
        }

        if ($maxPrice = $request->query('max_price')) {
            $query->where('price', '<=', $maxPrice);
        }
        $sort = $request->query('sort', 'newest');
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        // Phân trang (mặc định 20/sp)
        $perPage = (int) $request->query('per_page', 20);

        $products = $query->paginate($perPage);

        return response()->json($products);
    }

    public function show(Product $product)
    {
        if ($product->status !== 'active' || $product->stock_quantity <= 0) {
            return response()->json([
                'message' => 'Product not found',
            ], 404);
        }

        $product->load([
            'images',
            'reviews',
            'specifications', 
            'category',
            'brand',
        ]);

        return response()->json($product);
    }
}
