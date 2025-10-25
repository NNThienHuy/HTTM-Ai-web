<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;
    
     protected $fillable = [
        'cart_id', 
        'product_id', 
        'quantity',
    ];
    public $timestamps = false;

    /**
     * Lấy giỏ hàng (cart) mà món hàng này thuộc về (N-1)
     */
    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * Lấy thông tin sản phẩm (product) của món hàng này (N-1)
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}