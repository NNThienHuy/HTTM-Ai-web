<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class IsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        // SỬA: Đổi 'role' thành 'user_type' để khớp với database bảng accounts
        if (Auth::check() && Auth::user()->user_type === 'admin') {
            return $next($request);
        }

        return response()->json([
            'message' => 'Forbidden: Bạn không có quyền Admin.'
        ], 403);
    }
}