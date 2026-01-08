<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $primaryKey = 'customer_id';
    public $incrementing = true;        // ✅ SỬA
    protected $keyType = 'int';         // ✅ SỬA

    protected $fillable = [
        'account_id',
        'full_name',
        'address',
        'city',
        'district',
        'ward',
        'postal_code'
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_id', 'account_id');
    }

    public function cart(): HasOne
    {
        return $this->hasOne(Cart::class, 'customer_id', 'customer_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'customer_id', 'customer_id');
    }

    public function userBehavior(): HasOne
    {
        return $this->hasOne(UserBehavior::class, 'customer_id', 'customer_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class, 'customer_id', 'customer_id');
    }

    public function interactions(): HasMany
    {
        return $this->hasMany(UserProductInteraction::class, 'customer_id', 'customer_id');
    }
    public function behaviors(): HasMany
    {
        return $this->hasMany(UserBehavior::class, 'customer_id', 'customer_id');
    }
}