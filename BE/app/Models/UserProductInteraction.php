<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProductInteraction extends Model
{
    // Chỉ định tên bảng chính xác trong migration
    protected $table = 'user_product_interactions';
    
    protected $primaryKey = 'interaction_id';

    protected $fillable = [
        'customer_id',
        'guest_id',
        'product_id',
        'interaction_type', // 'view', 'cart', 'purchase'
        'interaction_value'
    ];

    /**
     * Quan hệ: Một tương tác thuộc về một sản phẩm
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    /**
     * Quan hệ: Một tương tác thuộc về một khách hàng (nếu đã đăng nhập)
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'customer_id');
    }

    /**
     * Quan hệ: Một tương tác thuộc về một khách vãng lai (nếu chưa đăng nhập)
     */
    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class, 'guest_id', 'guest_id');
    }
}