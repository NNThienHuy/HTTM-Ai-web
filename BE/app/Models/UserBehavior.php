<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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