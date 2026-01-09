<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Customer;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB; // <-- QUAN TRỌNG: Phải import thư viện này
use Illuminate\Support\Facades\Log; // <-- Để ghi log lỗi nếu cần kiểm tra
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // 1. Validate dữ liệu
        $validated = $request->validate([
            'username' => 'required|string|max:50|unique:accounts',
            'email' => 'required|email|max:100|unique:accounts',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'full_name' => 'required|string|max:100'
        ]);

        // 2. Sử dụng Transaction để đảm bảo an toàn dữ liệu
        try {
            $result = DB::transaction(function () use ($validated) {
                // BƯỚC A: Tạo Account
                $account = Account::create([
                    'username' => $validated['username'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'phone' => $validated['phone'] ?? null,
                    'user_type' => 'customer',
                    'status' => 'active'
                ]);

                // BƯỚC B: Tạo Customer (Map với Account)
                // Lưu ý: Đảm bảo model Account của bạn dùng khóa chính là 'account_id'
                // Nếu khóa chính là 'id', hãy sửa $account->account_id thành $account->id
                $customer = Customer::create([
                    'account_id' => $account->account_id, 
                    'full_name' => $validated['full_name']
                ]);

                // BƯỚC C: Tạo Cart (Map với Customer)
                Cart::create([
                    'customer_id' => $customer->customer_id,
                    'total_amount' => 0
                ]);

                // BƯỚC D: Tạo Token
                $token = $account->createToken('auth_token')->plainTextToken;

                // Trả về dữ liệu cần thiết để transaction hoàn tất
                return [
                    'token' => $token,
                    'user' => $account->load('customer')
                ];
            });

            // 3. Trả về response thành công (chỉ chạy khi Transaction không lỗi)
            return response()->json([
                'success' => true,
                'message' => 'Registration successful',
                'token' => $result['token'],
                'user' => $result['user']
            ], 201);

        } catch (\Exception $e) {
            // 4. Xử lý lỗi: Ghi log và báo lỗi cho Client
            Log::error('Register Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        $account = Account::where('email', $validated['email'])->first();

        if (!$account || !Hash::check($validated['password'], $account->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.']
            ]);
        }

        if ($account->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['Your account has been disabled.']
            ]);
        }

        $account->update(['last_login' => now()]);

        $token = $account->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user' => $account->load('customer')
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    public function user(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $request->user()->load('customer')
        ]);
    }
    // ... Các hàm register, login, logout, user có sẵn ở trên ...

    // --- THÊM HÀM NÀY VÀO CUỐI ---
  // Dán đè hàm này vào AuthController.php
    public function getUserByEmail($email)
    {
        try {
            // BƯỚC 1: Tìm Account (Không dùng ->with để tránh lỗi)
            $account = Account::where('email', $email)->first();

            if (!$account) {
                return response()->json(['message' => 'Email not found'], 404);
            }

            // BƯỚC 2: Tìm Customer thủ công bằng account_id
            // (Lưu ý: Đảm bảo bảng customers có cột account_id)
            $customer = Customer::where('account_id', $account->account_id)->first();
            
            // Nếu model dùng id thì sửa thành: $account->id
            // $customer = Customer::where('account_id', $account->id)->first();

            // BƯỚC 3: Gán customer vào account để trả về đúng định dạng frontend cần
            $account->setAttribute('customer', $customer);

            return response()->json($account);

        } catch (\Exception $e) {
            // Nếu vẫn lỗi, nó sẽ hiện chi tiết lỗi ra màn hình để ta biết đường sửa
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }

}