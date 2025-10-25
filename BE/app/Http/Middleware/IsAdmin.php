<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth; // <-- THÊM DÒNG NÀY ĐỂ SỬA LỖI

class IsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Kiểm tra xem user đã đăng nhập VÀ có role là 'admin' chưa
        // (Sửa lại cho rõ ràng hơn)
        if (Auth::check() && Auth::user()->role === 'admin') {
            
            // 2. Nếu đúng là admin, cho phép request đi tiếp
            return $next($request);
        }

        // 3. Nếu không phải admin, chặn lại và báo lỗi 403 (Forbidden)
        return response()->json([
            'message' => 'Forbidden: Bạn không có quyền Admin.'
        ], 403);
    }
}