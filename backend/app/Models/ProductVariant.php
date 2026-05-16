<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = ['product_id', 'color', 'size', 'sku', 'stock', 'price'];

    // Biến thể này thuộc về sản phẩm nào
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}