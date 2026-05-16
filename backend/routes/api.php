<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

// Các Route công khai (Khách vãng lai)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/settings', [AdminController::class, 'getSettings']);

// Các Route yêu cầu đăng nhập (Cả Khách hàng và Admin đều vào được)
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
    Route::put('/admin/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);

    // Gợi ý sản phẩm (AI Recommendation)
    Route::get('/recommendations', [RecommendationController::class, 'index']);
});

// Các Route bảo mật (Chỉ dành RIÊNG cho Admin thực hiện cấu trúc)
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    
    // Thêm sản phẩm mới (Kèm biến thể & Nhiều ảnh)
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    
    // Quản trị hệ thống & Thống kê
    Route::get('/admin/stats', [AdminController::class, 'getStats']);
    Route::get('/admin/orders', [AdminController::class, 'getOrders']);
    Route::post('/admin/settings', [AdminController::class, 'updateSettings']);
});