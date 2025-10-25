<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', // Cần thiết cho Cart::firstOrCreate() trong Controller
        'notes', // (Nếu bạn có cột này trong migration)
        // ... thêm các cột khác nếu cần gán giá trị hàng loạt
    ];
    /**
     * Lấy user sở hữu giỏ hàng này (N-1)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Lấy tất cả các món hàng trong giỏ (1-N)
     */
    public function items()
    {
        return $this->hasMany(CartItem::class);
    }
}