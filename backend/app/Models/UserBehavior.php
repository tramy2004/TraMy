<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserBehavior extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
        'type',
        'search_query' // 🔥 THÊM CHÍNH XÁC DÒNG NÀY VÀO ĐÂY FEN ƠI!
    ];
}
