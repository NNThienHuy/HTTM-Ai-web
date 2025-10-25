<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    /**
     * Lấy user đã viết đánh giá này (N-1)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Lấy sản phẩm được đánh giá (N-1)
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}