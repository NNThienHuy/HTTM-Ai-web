<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Xử lý yêu cầu đăng ký tài khoản mới.
     * Tương ứng với route: POST /api/register
     */
    public function register(Request $request)
    {
        // 1. Validate dữ liệu đầu vào
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::min(8)],
            // 'password_confirmation' phải được gửi kèm
        ]);

        // 2. Tạo User mới
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'customer',
        ]);

        // 3. Tạo token API cho user
        $token = $user->createToken('api-token-c' . $user->id)->plainTextToken;

        // 4. Trả về thông tin user và token
        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Xử lý yêu cầu đăng nhập.
     * Tương ứng với route: POST /api/login
     */
    public function login(Request $request)
    {
        // 1. Validate dữ liệu
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 2. Thử đăng nhập
        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Email hoặc mật khẩu không chính xác.'
            ], 401);
        }

        // 3. Đăng nhập thành công, lấy thông tin user
        $user = $request->user();

        // 4. Tạo token mới
        // (Xóa token cũ nếu bạn muốn user chỉ đăng nhập 1 nơi 1 lúc)
        // $user->tokens()->delete(); 
        $token = $user->createToken('api-token-' . $user->id)->plainTextToken;

        // 5. Trả về thông tin user và token
        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Xử lý yêu cầu đăng xuất.
     * Tương ứng với route: POST /api/logout (Phải được bảo vệ)
     */
    public function logout(Request $request)
    {
        // Lấy user đang đăng nhập và xóa token hiện tại
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Đăng xuất thành công.'
        ]);
    }
}