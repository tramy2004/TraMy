<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CategoryController; // Bổ sung CategoryController
use Illuminate\Support\Facades\Route;

// ==========================================
// Các Route công khai (Khách vãng lai)
// ==========================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Khách hàng cần xem được danh sách danh mục
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

Route::get('/settings', [AdminController::class, 'getSettings']);


// ==========================================
// Các Route yêu cầu đăng nhập (User & Admin)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'profile']);
    Route::put('/me', [AuthController::class, 'updateProfile']);

    // Giỏ hàng (Cart)
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::delete('/cart/remove/{id}', [CartController::class, 'remove']);
    Route::put('/cart/update/{id}', [CartController::class, 'updateQuantity']);

    // Đơn hàng (Order)
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);

    // Gợi ý sản phẩm (AI Recommendation)
    Route::get('/recommendations', [RecommendationController::class, 'index']);
});


// ==========================================
// Các Route bảo mật (Chỉ dành RIÊNG cho Admin)
// ==========================================
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    
    // Quản lý Sản phẩm
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Quản lý Danh mục (Chỉ Admin mới được thêm/sửa/xóa)
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
    
    // Quản trị hệ thống & Thống kê
    Route::get('/admin/stats', [AdminController::class, 'getStats']);
    Route::get('/admin/orders', [AdminController::class, 'getOrders']);
    
    // Đã di chuyển route này xuống khu vực an toàn!
    Route::put('/admin/orders/{id}/status', [AdminController::class, 'updateOrderStatus']); 
    
    Route::post('/admin/settings', [AdminController::class, 'updateSettings']);
});