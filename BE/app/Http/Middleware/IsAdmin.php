<?php

// namespace App\Http\Middleware;

// use Closure;
// use Illuminate\Http\Request;
// use Symfony\Component\HttpFoundation\Response;
// use Illuminate\Support\Facades\Auth;

// class IsAdmin
// {
//     public function handle(Request $request, Closure $next): Response
//     {
//         // SỬA: Đổi 'role' thành 'user_type' để khớp với database bảng accounts
//         if (Auth::check() && Auth::user()->user_type === 'admin') {
//             return $next($request);
//         }

//         return response()->json([
//             'message' => 'Forbidden: Bạn không có quyền Admin.'
//         ], 403);
//     }
// }
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class IsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // ✅ TODO: đổi điều kiện này theo DB của bạn
        // Option A: có cột is_admin (boolean)
        if (isset($user->is_admin) && $user->is_admin) return $next($request);

        // Option B: có cột role = 'admin'
        if (isset($user->role) && $user->role === 'admin') return $next($request);

        return response()->json(['message' => 'Forbidden (admin only)'], 403);
    }
}