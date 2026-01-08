<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ImageController extends Controller
{
    public function uploadMainImage(Request $request)
    {
        if ($request->hasFile('uploadedFile')) {
            $file = $request->file('uploadedFile');
            $filename = time() . '_' . $file->getClientOriginalName();
            // Lưu vào thư mục public/images hoặc storage/app/public
            $file->move(public_path('images'), $filename);

            return response()->json([
                'name' => $filename,
                'status' => 'success'
            ], 200);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }

    public function getProductImages($productId)
    {
        // Trả về danh sách ảnh phụ (nếu có logic bảng product_images)
        // Tạm thời trả về rỗng để FE không lỗi
        return response()->json([]);
    }
}