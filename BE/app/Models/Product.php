<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    /**
     * Nếu table là 'products' thì không cần khai báo $table.
     * protected $table = 'products';
     */

    // Các field cho phép gán hàng loạt (mass assignment)
    protected $fillable = [
        'name',
        'slug',
        'category_id',
        'brand_id',
        'price',
        'sale_price',
        'stock_quantity',
        'description',
        'status',
        // thêm các cột khác của bảng products nếu bạn có:
        // 'short_description',
        // 'thumbnail_url',
        // ...
    ];

    // Ép kiểu cho đúng (rất hữu ích khi trả JSON)
    protected $casts = [
        'price'          => 'float',
        'sale_price'     => 'float',
        'stock_quantity' => 'integer',
    ];

    // Tự động append mấy field computed ra JSON (nếu muốn)
    protected $appends = [
        'final_price',
        'avg_rating',
        'rating_count',
    ];

    // ==========================================
    // == RELATIONSHIPS
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

    /**
     * Quan hệ đến bảng product_features (cho hệ KNN).
     * Một sản phẩm có MỘT record features tương ứng.
     */
    public function feature()
    {
        return $this->hasOne(ProductFeature::class);
        // nhớ tạo model ProductFeature tương ứng với bảng product_features
    }

    // ==========================================
    // == ACCESSORS / COMPUTED ATTRIBUTES
    // ==========================================

    /**
     * Giá cuối cùng hiển thị cho user (ưu tiên sale_price nếu có).
     */
    public function getFinalPriceAttribute(): float
    {
        // Nếu không có sale_price thì dùng price
        $sale = $this->sale_price ?? 0;
        return $sale > 0 ? $sale : (float) $this->price;
    }

    /**
     * Rating trung bình (dựa trên quan hệ reviews).
     * Nếu bạn đã save avg_rating trong bảng products thì có thể dùng trực tiếp.
     */
    public function getAvgRatingAttribute(): ?float
    {
        // Nếu đã eager load 'reviews' thì sẽ không query lại
        if ($this->relationLoaded('reviews')) {
            $avg = $this->reviews->avg('rating');
            return $avg ? round($avg, 2) : null;
        }

        // Không eager load thì query riêng
        $avg = $this->reviews()->avg('rating');
        return $avg ? round($avg, 2) : null;
    }

    /**
     * Số lượng đánh giá.
     */
    public function getRatingCountAttribute(): int
    {
        if ($this->relationLoaded('reviews')) {
            return $this->reviews->count();
        }

        return (int) $this->reviews()->count();
    }
}
