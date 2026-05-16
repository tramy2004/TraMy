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
       Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('total');
            $table->string('status')->default('pending');
            
            // 🔥 THÊM DÒNG NÀY VÀO ĐÂY FEN ƠI: Lưu lý do khách hủy đơn (cho phép để trống)
            $table->text('cancel_reason')->nullable();
            
            $table->string('payment_method');
            
            // 4 cột thông tin nhận hàng của đơn
            $table->string('phone')->nullable();
            $table->string('address_detail')->nullable();
            $table->string('ward')->nullable();
            $table->string('province')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
