<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductCategory extends Model
{
    // Chỉ định tên bảng vì migration của bạn là 'product_categories'
    protected $table = 'product_categories';
    
    protected $primaryKey = 'category_id';

    protected $fillable = [
        'category_name',
        'description'
    ];

    /**
     * Quan hệ: Một danh mục có nhiều sản phẩm
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'category_id', 'category_id');
    }
}