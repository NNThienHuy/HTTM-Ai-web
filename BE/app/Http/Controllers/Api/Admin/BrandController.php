<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    /**
     * Lấy tất cả thương hiệu.
     */
    public function index()
    {
        $brands = Brand::orderBy('name', 'asc')->get();
        return response()->json($brands);
    }


    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:brands',
            'logo_url' => 'nullable|url'
        ]);

        $brand = Brand::create($data);
        return response()->json($brand, 201);
    }


    public function show(Brand $brand)
    {
        return response()->json($brand);
    }

    public function update(Request $request, Brand $brand)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:brands,name,' . $brand->id,
            'logo_url' => 'nullable|url'
        ]);

        $brand->update($data);
        return response()->json($brand);
    }

    public function destroy(Brand $brand)
    {
        $brand->delete();
        return response()->json(null, 204);
    }
}