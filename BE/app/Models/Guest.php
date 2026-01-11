<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\UserProductInteraction> $interactions
 * @property-read int|null $interactions_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Guest newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Guest newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Guest query()
 * @mixin \Eloquent
 */
class Guest extends Model
{
    // Chỉ định tên bảng vì migration của bạn là 'guest'
    protected $table = 'guest'; 
    
    protected $primaryKey = 'guest_id';

    protected $fillable = [
        'session_id', // Lưu ID phiên làm việc
        'ip_address',
        'device_info'
    ];

    /**
     * Quan hệ: Một khách vãng lai có thể có nhiều tương tác (View/Cart)
     * Thường dùng để lưu vết trước khi họ đăng ký tài khoản
     */
    public function interactions(): HasMany
    {
        return $this->hasMany(UserProductInteraction::class, 'guest_id', 'guest_id');
    }
}