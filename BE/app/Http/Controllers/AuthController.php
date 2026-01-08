<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Customer;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:50|unique:accounts',
            'email' => 'required|email|max:100|unique:accounts',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'full_name' => 'required|string|max:100'
        ]);

        $account = Account::create([
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'user_type' => 'customer',
            'status' => 'active'
        ]);

        $customer = Customer::create([
            'account_id' => $account->account_id,
            'full_name' => $validated['full_name']
        ]);

        Cart::create([
            'customer_id' => $customer->customer_id,
            'total_amount' => 0
        ]);

        $token = $account->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'token' => $token,
            'user' => $account->load('customer')
        ], 201);
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
}