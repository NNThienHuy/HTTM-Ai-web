<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    // Lấy danh sách người dùng
    public function index(Request $request)
    {
        $users = User::orderBy('name', 'asc')->paginate(20);
        return response()->json($users);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => ['required', Password::min(8)],
            'role'     => 'required|in:admin,customer',
        ]);

        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);

        return response()->json($user, 201);
    }

    // Xem chi tiết người dùng
    public function show(User $user)
    {
        return response()->json($user);
    }

    // Cập nhật người dùng
    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'     => 'sometimes|required|string|max:255',
            'email'    => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
            'role'     => 'sometimes|required|in:admin,customer',
            'password' => ['nullable', Password::min(8)],
        ]);

        if (array_key_exists('password', $data) && $data['password']) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']); // tránh set null
        }

        $user->update($data);
        return response()->json($user);
    }

    // Xóa người dùng
    public function destroy(Request $request, User $user)
    {
        // Ngăn admin tự xóa chính mình
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'Bạn không thể tự xóa chính mình.'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'Xóa người dùng thành công.'], 200);
    }
}
