<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductReview extends Model
{
    protected $table = 'product_reviews';
    protected $primaryKey = 'review_id';

    protected $fillable = [
        'product_id',
        'customer_id',
        'rating',
        'comment'
    ];

    /**
     * Quan hệ: Một đánh giá thuộc về một sản phẩm
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    /**
     * Quan hệ: Một đánh giá được viết bởi một khách hàng
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'customer_id');
    }
}