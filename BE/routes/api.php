<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\Api\Admin\CategoryController;
// --- Nhóm các Route CÔNG KHAI (Public Routes) ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

//  Lấy danh sách sản phẩm (có lọc, tìm kiếm, phân trang)
Route::get('/products', [ProductController::class, 'index']);

//  Xem chi tiết 1 sản phẩm
Route::get('/products/{productId}', [ProductController::class, 'show']);
// Lấy danh sách các danh mục máy tính
Route::get('/product-categories', [ProductController::class, 'getCategories']);

// --- Nhóm các Route YÊU CẦU ĐĂNG NHẬP (Protected Routes) ---
Route::middleware('auth:sanctum')->group(function () {
    // Lấy thông tin chi tiết của người dùng đang đăng nhập
    Route::get('/user', [AuthController::class, 'user']);
    // Đăng xuất và hủy Token hiện tại
    Route::post('/logout', [AuthController::class, 'logout']);
    // Lấy thông tin giỏ hàng hiện tại
    Route::get('/cart', [CartController::class, 'getCart']);
    // Cập nhật số lượng của một item trong giỏ (Dùng ID của CartItem)
    Route::put('/cart/items/{cartItemId}', [CartController::class, 'updateItem']);
    // Xóa một sản phẩm khỏi giỏ
    Route::delete('/cart/items/{cartItemId}', [CartController::class, 'removeItem']);
    // Xóa sạch giỏ hàng
    Route::post('/cart/clear', [CartController::class, 'clearCart']);
    // Đặt hàng & Lịch sử
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/recommendations/personalized', [RecommendationController::class, 'getPersonalized']);
});
// --- Nhóm các Route chỉ dành cho ADMIN ---
Route::middleware(['auth:sanctum', 'isadmin'])->prefix('admin')->group(function () {
    
    // Quản lý danh mục (Category)
    Route::get('/categories', [CategoryController::class, 'index']);     // Lấy danh sách
    Route::post('/categories', [CategoryController::class, 'store']);    // Tạo mới
    Route::get('/categories/{category}', [CategoryController::class, 'show']); // Chi tiết
    Route::put('/categories/{category}', [CategoryController::class, 'update']); // Cập nhật
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']); // Xóa
});