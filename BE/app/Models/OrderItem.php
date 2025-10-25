<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    // ==========================================
    // == ĐỊNH NGHĨA RELATIONSHIPS
    // ==========================================

    /**
     * Một OrderItem thuộc về một Order (N-1)
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Một OrderItem thuộc về một Product (N-1)
     * (Để lấy thông tin sản phẩm)
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}