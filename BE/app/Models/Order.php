<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    // ==========================================
    // == ĐỊNH NGHĨA RELATIONSHIPS
    // ==========================================

    /**
     * Một Order thuộc về một User (N-1)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Một Order có nhiều Order Items (1-N)
     */
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}