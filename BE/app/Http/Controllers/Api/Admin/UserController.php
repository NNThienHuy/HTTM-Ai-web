<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Account; // Sửa từ User thành Account
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // Lấy danh sách người dùng
    public function index(Request $request)
    {
       // FE mong đợi: id, email, role. Account có account_id, email, user_type
        $accounts = Account::all()->map(function($acc) {
            return [
                'id' => $acc->account_id,
                'email' => $acc->email,
                'role' => $acc->user_type, // FE dùng 'role', BE dùng 'user_type'
                'name' => $acc->username
            ];
        });
        return response()->json($accounts);
    }

    public function store(Request $request)
    {// FE gửi: email, password, role
        $validated = $request->validate([
            'email' => 'required|email|unique:accounts',
            'password' => 'required|min:8',
            'role' => 'required'
        ]);

        $account = Account::create([
            'username' => explode('@', $validated['email'])[0], // Tự tạo username từ email
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'user_type' => $validated['role'] == 'admin' ? 'admin' : 'customer',
            'status' => 'active'
        ]);

        // Nếu là customer, tạo thêm bản ghi customer
        if ($account->user_type === 'customer') {
            Customer::create(['account_id' => $account->account_id, 'full_name' => $account->username]);
        }

        return response()->json($account, 201);
    }

    // Xem chi tiết người dùng
    public function show($id)
    {
        $account = Account::find($id);
        if(!$account) return response()->json(['message' => 'Not found'], 404);

        return response()->json([
            'id' => $account->account_id,
            'email' => $account->email,
            'role' => $account->user_type,
        ]);
    }

    // Cập nhật người dùng
   public function update(Request $request, $id)
    {
        $account = Account::find($id);
        if(!$account) return response()->json(['message' => 'Not found'], 404);

        $data = $request->all();
        
        if (!empty($data['password'])) {
            $account->password = Hash::make($data['password']);
        }
        if (!empty($data['role'])) {
            $account->user_type = $data['role'];
        }
        if (!empty($data['email'])) {
            $account->email = $data['email'];
        }

        $account->save();
        return response()->json($account);
    }

    // Xóa người dùng
    public function destroy($id)
    {
        Account::destroy($id); // Hoặc logic xóa mềm
        return response()->json(null, 204);
    }
}