<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    
    // (Bạn có thể thêm $fillable ở đây nếu cần)

    // ==========================================
    // == ĐỊNH NGHĨA RELATIONSHIPS
    // ==========================================

    /**
     * Một Product thuộc về một Category (N-1)
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Một Product thuộc về một Brand (N-1)
     */
    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    /**
     * Một Product có nhiều Reviews (1-N)
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Một Product có nhiều Images (1-N)
     */
    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    /**
     * Một Product có nhiều Specifications (1-N)
     */
    public function specifications()
    {
        return $this->hasMany(ProductSpecification::class);
    }
}