<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Customer;
use App\Models\Admin;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // 1. LẤY DANH SÁCH (ALL ACCOUNTS)
public function index(Request $request)
{
    $query = Account::with(['customer', 'admin']);

    if ($request->filled('q')) {
        $search = $request->q;
        $query->where(function ($q) use ($search) {
            $q->where('username', 'LIKE', "%{$search}%")
              ->orWhere('email', 'LIKE', "%{$search}%")
              ->orWhereHas('customer', function ($sq) use ($search) {
                  $sq->where('full_name', 'LIKE', "%{$search}%");
              })
              ->orWhereHas('admin', function ($sq) use ($search) {
                  $sq->where('full_name', 'LIKE', "%{$search}%");
              });
        });
    }

    // Mặc định trả về toàn bộ (để FE admin hiển thị ALL accounts DB)
    $accounts = $query->orderBy('created_at', 'desc')->get();

    // Chuẩn hoá format cho FE: { id, email, role, ... }
    $users = $accounts->map(function ($a) {
        return [
            'id' => $a->account_id ?? $a->id,
            'email' => $a->email,
            'role' => $a->user_type ?? ($a->admin ? 'admin' : 'customer'),
            'username' => $a->username,
            'name' => $a->customer->full_name ?? $a->admin->full_name ?? null,
            'created_at' => optional($a->created_at)->toDateTimeString(),
        ];
    });

    return response()->json([
        'success' => true,
        'data' => $users,
    ]);
}

    // 2. XEM CHI TIẾT
    public function show($id)
    {
        // findOrFail sẽ tự tìm theo 'account_id' nhờ khai báo trong Model
        $account = Account::with(['customer', 'admin'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $account]);
    }

    // 3. TẠO MỚI
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:accounts,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,customer',
        ]);

        try {
            $newAccount = DB::transaction(function () use ($request) {
                // Tạo Account
                $account = Account::create([
                    'username' => explode('@', $request->email)[0] . rand(100, 999),
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'user_type' => $request->role,
                    'status' => 'active',
                ]);

                // Tạo Customer hoặc Admin
                if ($request->role === 'customer') {
                    $customer = Customer::create([
                        'account_id' => $account->account_id,
                        'full_name' => $request->name,
                    ]);
                    Cart::create(['customer_id' => $customer->customer_id, 'total_amount' => 0]);
                } else {
                    Admin::create([
                        'account_id' => $account->account_id,
                        'role' => 'Super Admin',
                    ]);
                }

                return $account->load('customer');
            });

            return response()->json([
                'success' => true, 
                'message' => 'Tạo thành công', 
                'data' => $newAccount
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // 4. CẬP NHẬT
    public function update(Request $request, $id)
    {
        $account = Account::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:100',
            // Fix lỗi Unique Email: Bỏ qua ID hiện tại
            'email' => [
                'required', 
                'email', 
                Rule::unique('accounts', 'email')->ignore($account->account_id, 'account_id')
            ],
            'password' => 'nullable|string|min:6',
        ]);

        DB::transaction(function () use ($request, $account) {
            $dataAccount = ['email' => $request->email];
            if ($request->filled('password')) {
                $dataAccount['password'] = Hash::make($request->password);
            }
            $account->update($dataAccount);

            // Update Name
            if ($account->user_type === 'customer' && $account->customer) {
                $account->customer->update(['full_name' => $request->name]);
            } else if ($account->user_type === 'admin') {
                $account->update(['username' => $request->name]);
            }
        });

        return response()->json([
            'success' => true, 
            'message' => 'Cập nhật thành công', 
            'data' => $account->fresh('customer')
        ]);
    }

    // 5. XÓA (FIX LỖI ID)
    public function destroy($id)
    {
        $account = Account::findOrFail($id);

        // 1. KIỂM TRA: Nếu là Admin thì báo lỗi ngay
        // (Sử dụng hàm isAdmin() có sẵn trong Model Account hoặc check user_type)
        if ($account->user_type === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa tài khoản Quản trị viên (Admin). Chỉ được phép xóa Khách hàng.'
            ], 403);
        }

        // 2. Nếu là Customer thì tiến hành xóa
        try {
            DB::transaction(function () use ($account) {
                if ($account->customer) {
                    // Xóa giỏ hàng trước (nếu có)
                    if ($account->customer->cart) {
                        $account->customer->cart->delete();
                    }
                    // Xóa thông tin khách hàng
                    $account->customer->delete();
                }

                // Cuối cùng xóa tài khoản đăng nhập
                $account->delete();
            });

            return response()->json([
                'success' => true, 
                'message' => 'Đã xóa khách hàng thành công.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Lỗi khi xóa: ' . $e->getMessage()
            ], 500);
        }
    }
}