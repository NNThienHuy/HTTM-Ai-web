<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    use HasFactory;

    /**
     * Lấy tất cả sản phẩm thuộc về thương hiệu này (1-N)
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}