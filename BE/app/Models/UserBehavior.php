<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $behavior_id
 * @property int $customer_id
 * @property string|null $viewed_products
 * @property string|null $purchase_history
 * @property string|null $ratings
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Customer $customer
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserBehavior newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserBehavior newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserBehavior query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserBehavior whereBehaviorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserBehavior whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserBehavior whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserBehavior wherePurchaseHistory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserBehavior whereRatings($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserBehavior whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserBehavior whereViewedProducts($value)
 * @mixin \Eloquent
 */
class UserBehavior extends Model
{
    // Chỉ định tên bảng nếu migration của bạn không theo số nhiều chuẩn
    protected $table = 'user_behaviors'; 
    
    protected $primaryKey = 'behavior_id';

    protected $fillable = [
        'customer_id',
        'action_type', // ví dụ: 'search', 'filter', 'view_page'
        'action_detail', // ví dụ: 'laptop gaming', 'price_desc'
        'ip_address',
        'device_info'
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'customer_id');
    }
}