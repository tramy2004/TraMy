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
       Schema::create('product_variants', function (Blueprint $table) {
        $table->id();
        // Khóa ngoại liên kết với bảng products, nếu xóa product thì tự động xóa variant
        $table->foreignId('product_id')->constrained()->onDelete('cascade'); 
        $table->string('color'); // Ví dụ: Đỏ, Đen, Trắng
        $table->string('size');  // Ví dụ: S, M, L, XL
        $table->string('sku')->unique()->nullable(); // Mã định danh kho hàng (Ví dụ: AO-THUN-DEN-M)
        $table->integer('stock')->default(0);        // Số lượng tồn kho cho size-màu này
        $table->decimal('price', 15, 2)->nullable(); // Giá riêng nếu có (null thì lấy giá gốc của Product)
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
