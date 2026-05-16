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
       Schema::create('user_behaviors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // 🔥 NÂNG CẤP 1: Thêm ->nullable() vì khi tìm kiếm (search) sẽ không có product_id
            $table->foreignId('product_id')->nullable()->constrained()->cascadeOnDelete();
            
            $table->string('type'); // view | click | add_to_cart | search
            
            // 🔥 NÂNG CẤP 2: Thêm cột lưu từ khóa tìm kiếm của user (cho phép rỗng)
            $table->string('search_query')->nullable(); 
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_behaviors');
    }
};
