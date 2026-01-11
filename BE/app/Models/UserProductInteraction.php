<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $interaction_id
 * @property int $customer_id
 * @property int $product_id
 * @property string $interaction_type
 * @property numeric $interaction_value
 * @property string $interaction_date
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Customer $customer
 * @property-read \App\Models\Guest|null $guest
 * @property-read \App\Models\Product $product
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserProductInteraction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserProductInteraction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserProductInteraction query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserProductInteraction whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserProductInteraction whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserProductInteraction whereInteractionDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserProductInteraction whereInteractionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserProductInteraction whereInteractionType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserProductInteraction whereInteractionValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserProductInteraction whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserProductInteraction whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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