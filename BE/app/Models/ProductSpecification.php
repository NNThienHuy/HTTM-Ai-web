<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductSpecification extends Model
{
    use HasFactory;
    
    /**
     * Bảng này không cần timestamps (created_at, updated_at).
     */
    public $timestamps = false;
    
    /**
     * Lấy sản phẩm mà thông số này thuộc về (N-1)
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}