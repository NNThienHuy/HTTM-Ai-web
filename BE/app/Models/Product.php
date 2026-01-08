<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $primaryKey = 'product_id';
    public $incrementing = true;        // ✅ SỬA
    protected $keyType = 'int';         // ✅ SỬA

    protected $fillable = [
        'name',
        'description',
        'price',
        'category_id',
        'image_url',
        'stock_quantity',
        'rating',
        'views'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'rating' => 'decimal:2',
        'views' => 'integer',
        'stock_quantity' => 'integer'
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_id', 'category_id');
    }

    public function laptopFeature(): HasOne
    {
        return $this->hasOne(LaptopFeature::class, 'product_id', 'product_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class, 'product_id', 'product_id');
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class, 'product_id', 'product_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'product_id', 'product_id');
    }

    public function inventoryItems(): HasMany
    {
        return $this->hasMany(InventoryItem::class, 'product_id', 'product_id');
    }

    public function interactions(): HasMany
    {
        return $this->hasMany(UserProductInteraction::class, 'product_id', 'product_id');
    }

    public function incrementViews(): void
    {
        $this->increment('views');
    }

    public function isInStock(): bool
    {
        return $this->stock_quantity > 0;
    }

    public function getFormattedPriceAttribute(): string
    {
        return number_format($this->price, 0, ',', '.') . ' VNĐ';
    }
}