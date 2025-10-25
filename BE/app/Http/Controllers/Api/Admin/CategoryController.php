<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Lấy tất cả danh mục.
     */
    public function index()
    {
        // Lấy tất cả danh mục, bao gồm cả danh mục cha 
        $categories = Category::with('parent')->orderBy('name', 'asc')->get();
        return response()->json($categories);
    }

    /**
     * Tạo danh mục mới.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:categories',
            'parent_id' => 'nullable|exists:categories,id'
        ]);

        // Tự động tạo slug
        $data['slug'] = Str::slug($data['name']);

        $category = Category::create($data);
        return response()->json($category, 201);
    }

    /**
     * Xem chi tiết một danh mục.
     */
    public function show(Category $category)
    {
        // Tải các mối quan hệ (cha và con)
        $category->load(['parent', 'children']);
        return response()->json($category);
    }

    /**
     * Cập nhật một danh mục.
     */
    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'parent_id' => 'nullable|exists:categories,id'
        ]);

        // Cập nhật slug nếu tên thay đổi
        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);
        return response()->json($category);
    }

    /**
     * Xóa một danh mục.
     */
    public function destroy(Category $category)
    {
        $category->delete();
        return response()->json(null, 204);
    }
}