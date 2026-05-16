<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Product;
use App\Models\Cart;
use App\Models\ProductVariant; // 🔥 THÊM DÒNG NÀY ĐỂ LIÊN KẾT MODEL BIẾN THỂ

class CartItem extends Model
{
    // 🔥 1. Bổ sung 'product_variant_id' vào mảng fillable
    protected $fillable = ['cart_id', 'product_id', 'product_variant_id', 'quantity'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    // 🔥 2. THÊM CHÍNH XÁC HÀM NÀY ĐỂ KÉO DATA MÀU/SIZE SANG REACT
    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}