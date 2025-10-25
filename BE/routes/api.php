<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ==========================================================
// == 1. IMPORT CONTROLLERS
// ==========================================================
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController; 
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController; 
use App\Http\Controllers\Api\Admin\BrandController as AdminBrandController;    
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\ProductRecommendController;
use App\Http\Controllers\Api\ProductEventController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ===============================================
// == 2. CÁC ROUTE XÁC THỰC (AUTH)
// ===============================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [PasswordResetController::class, 'forgot']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);
// ===============================================
// == 3. CÁC ROUTE CÔNG KHAI (PUBLIC)
// ===============================================
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/brands/{brand}', [BrandController::class, 'show']);
Route::post('/products/{id}/events', [ProductEventController::class, 'store']);

// ===============================================
// == 4. CÁC ROUTE CẦN BẢO VỆ (PROTECTED USER)
// ===============================================
Route::middleware('auth:sanctum')->group(function () {
    
    //Auth, Cart, Orders
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/cart', [CartController::class, 'show']);
    Route::post('/cart/items', [CartController::class, 'addItem']);
    Route::put('/cart/items/{cartItem}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{cartItem}', [CartController::class, 'removeItem']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/products/{id}/similar', [ProductRecommendController::class, 'similar']);
});

// ===============================================
// == 5. CÁC ROUTE ADMIN (BẢO VỆ BẰNG 'isAdmin')
// ===============================================
Route::middleware(['auth:sanctum', 'isAdmin'])->prefix('admin')->group(function () {
    
    // Quản lý Sản phẩm (CRUD)
    Route::apiResource('/products', AdminProductController::class);

    // Quản lý Đơn hàng
    Route::apiResource('/orders', AdminOrderController::class)->except(['store']);

    // Quản lý Danh mục 
    Route::apiResource('/categories', AdminCategoryController::class);
    
    // Quản lý Thương hiệu
    Route::apiResource('/brands', AdminBrandController::class);
    
    // Quản lý Người dùng
    Route::apiResource('/users', AdminUserController::class);

    // Thống kê
    Route::get('/general',          [DashboardController::class, 'general']);
    Route::get('/revenue-trend',    [DashboardController::class, 'revenueTrend']);
    Route::get('/orders-by-status', [DashboardController::class, 'ordersByStatus']);
    Route::get('/top-products',     [DashboardController::class, 'topProducts']);
    Route::get('/sales-by-category',[DashboardController::class, 'salesByCategory']);
    Route::get('/top-customers',    [DashboardController::class, 'topCustomers']);
    Route::get('/hourly-today',     [DashboardController::class, 'hourlyToday']);
    Route::get('/monthly-revenue',  [DashboardController::class, 'monthlyRevenue']);

});
// ===============================================
// == 6. CÁC ROUTE CHO THANH TOÁN (WEBHOOK)
// ===============================================
// VnPay sẽ gọi về route này (dùng GET)
Route::get('/payment/vnpay-callback', [PaymentController::class, 'vnpayCallback']);