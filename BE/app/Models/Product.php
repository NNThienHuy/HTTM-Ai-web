<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Scout\Searchable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Product extends Model
{
    use HasFactory, Searchable;
    protected $primaryKey = 'product_id';
    public $incrementing = true;        // ✅ SỬA
    protected $keyType = 'int';         // ✅ SỬA
    protected $appends = ['title']; // Tự động thêm field 'title' vào JSON

// Tạo Accessor để map 'name' sang 'title'
    public function getTitleAttribute()
    {
        return $this->attributes['name'];
    }
    public function toSearchableArray()
    {
        // Load quan hệ để tìm luôn trong cấu hình laptop
        $this->load('laptopFeature'); 
        $features = $this->laptopFeature;
        return [
           'product_id' => $this->product_id,
        'id' => $this->product_id,
        'name' => $this->name,
        'description' => $this->description,
        'category' => $this->category ? $this->category->name : '',
        
        // --- KỸ THUẬT QUAN TRỌNG: Thêm tiền tố vào dữ liệu index ---
        // Thay vì chỉ lưu "16", ta lưu "RAM 16GB 16 GB" để khách gõ kiểu nào cũng dính
        'cpu' => $features ? "CPU {$features->processor} {$features->cpu}" : '',
        'ram' => $features ? "RAM {$features->ram}GB {$features->ram} GB memory" : '',
        'storage' => $features ? "SSD HDD {$features->storage}GB {$features->storage} GB" : '',
        'screen' => $features ? "Màn hình {$features->screen_size} inch" : '',
        'gpu' => $features ? "VGA GPU Card đồ họa {$features->gpu}" : '',
        ];
    }
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