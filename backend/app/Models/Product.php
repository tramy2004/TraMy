<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'price',
        'image', // Giữ lại làm ảnh thumbnail đại diện bên ngoài danh sách
        'description',
        'category_id',
        'sold_count'
    ];


    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

 
    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }


    public function category()
    {
        return $this->belongsTo(Category::class); // Đảm bảo fen có Model Category nhé
    }
}