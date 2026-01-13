<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\RecommendationController;
// Admin Controllers
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\MerchantController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ImageController;
use App\Http\Controllers\Api\Admin\AdminStatsController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- Public Routes ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public Product Routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/search', [ProductController::class, 'search']);
Route::get('/products/{productId}', [ProductController::class, 'show']);
Route::get('/product-categories', [ProductController::class, 'getCategories']);

// --- Protected Routes (Logged in users) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // --- [ĐÃ SỬA] Route lấy thông tin user theo email ---
    // Phải đặt ở đây để User thường cũng gọi được
    // Trỏ đúng vào AuthController như bạn đã viết hàm
    Route::get('/users/email/{email}', [AuthController::class, 'getUserByEmail']);
    
    // Cart & Order for Customer
    Route::get('/cart', [CartController::class, 'getCart']);
    Route::put('/cart/items/{cartItemId}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{cartItemId}', [CartController::class, 'removeItem']);
    Route::post('/cart/clear', [CartController::class, 'clearCart']);
    
    // Customer Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    
    Route::get('/recommendations/personalized', [RecommendationController::class, 'getPersonalized']);
});

// --- ADMIN ROUTES ---
Route::middleware(['auth:sanctum', 'isadmin'])->group(function () {
    
    // 1. Users (Frontend gọi /api/users để quản lý user)
    Route::apiResource('users', UserController::class);

    // 2. Merchants
    // Route::apiResource('merchants', MerchantController::class);

    // 3. Categories
    Route::apiResource('categories', CategoryController::class);

    // 4. Products (Quản lý sản phẩm bởi Admin)
    Route::post('/products', [AdminProductController::class, 'store']);
    Route::put('/products/{id}', [AdminProductController::class, 'update']);
    Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);
    
    // 5. Orders (Quản lý đơn hàng bởi Admin)
    Route::get('/admin/orders', [AdminOrderController::class, 'index']); 
    Route::get('/admin/orders/{order}', [AdminOrderController::class, 'show']);
    Route::put('/admin/orders/{order}', [AdminOrderController::class, 'update']);
    Route::delete('/admin/orders/{order}', [AdminOrderController::class, 'destroy']);
    
    // Route lấy sản phẩm trong đơn (cho Admin)
    Route::get('/admin/order-product/{orderId}', [AdminOrderController::class, 'getOrderProducts']);
    Route::delete('/admin/order-product/{orderId}', [AdminOrderController::class, 'deleteOrderProducts']);
    
    // Route đặc biệt FE gọi để lấy sản phẩm trong đơn
    Route::get('/order-product/{orderId}', [AdminOrderController::class, 'getOrderProducts']);
    Route::delete('/order-product/{orderId}', [AdminOrderController::class, 'deleteOrderProducts']);

    // 6. Image Upload
    Route::post('/main-image', [ImageController::class, 'uploadMainImage']);
    Route::get('/images/{productId}', [ImageController::class, 'getProductImages']);
});
    Route::get('/admin/stats', [AdminStatsController::class, 'index']);