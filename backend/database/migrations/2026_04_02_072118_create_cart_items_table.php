<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            // Khóa ngoại liên kết ngược về bảng carts gốc
            $table->foreignId('cart_id')->constrained()->cascadeOnDelete();
            
            // Khóa ngoại liên kết tới sản phẩm chính
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            
            // 🔥 NÂNG CẤP TẠI ĐÂY: Thêm khóa ngoại liên kết tới biến thể Màu/Size được chọn
            $table->foreignId('product_variant_id')->constrained()->cascadeOnDelete();
            
            // Số lượng sản phẩm khách mua
            $table->integer('quantity')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};