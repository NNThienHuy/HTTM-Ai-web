<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\UserProductInteraction;
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

    public function show(Request $request, string $productId)
    {
        $product = Product::with(['category', 'laptopFeature', 'reviews.customer'])
            ->findOrFail($productId);

        $product->incrementViews();

        // Record interaction - XÓA Str::uuid()
        if ($request->user()) {
            $customer = $request->user()->customer;
            if ($customer) {
                UserProductInteraction::create([
                    'customer_id' => $customer->customer_id,
                    'product_id' => $productId,
                    'interaction_type' => 'view',
                    'interaction_value' => 1.0
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'product' => $product
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
}