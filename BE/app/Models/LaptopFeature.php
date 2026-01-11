<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
/**
 * @property int $feature_id
 * @property int $product_id
 * @property string|null $brand
 * @property string|null $processor
 * @property int|null $ram
 * @property int|null $storage
 * @property numeric|null $screen_size
 * @property string|null $gpu
 * @property string|null $price_range
 * @property numeric|null $weight
 * @property int|null $battery_life
 * @property string|null $purpose
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Product $product
 * @method static \Database\Factories\LaptopFeatureFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LaptopFeature newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LaptopFeature newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LaptopFeature query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LaptopFeature whereBatteryLife($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LaptopFeature whereBrand($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LaptopFeature whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LaptopFeature whereFeatureId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LaptopFeature whereGpu($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LaptopFeature wherePriceRange($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LaptopFeature whereProcessor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LaptopFeature whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LaptopFeature wherePurpose($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LaptopFeature whereRam($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LaptopFeature whereScreenSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LaptopFeature whereStorage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LaptopFeature whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LaptopFeature whereWeight($value)
 * @mixin \Eloquent
 */
class LaptopFeature extends Model
{
    use HasFactory;
    protected $primaryKey = 'feature_id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'product_id',
        'brand',
        'processor',
        'ram',
        'storage',
        'screen_size',
        'gpu',
        'price_range',
        'weight',
        'battery_life',
        'purpose'
    ];

    protected $casts = [
        'ram' => 'integer',
        'storage' => 'integer',
        'screen_size' => 'decimal:1',
        'weight' => 'decimal:2',
        'battery_life' => 'integer'
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    public function getNormalizedFeatures(): array
    {
        return [
            'ram' => $this->normalizeRam(),
            'storage' => $this->normalizeStorage(),
            'screen_size' => $this->normalizeScreenSize(),
            'price' => $this->normalizePriceRange(),
            'weight' => $this->normalizeWeight(),
            'battery_life' => $this->normalizeBatteryLife(),
        ];
    }

    private function normalizeRam(): float
    {
        return min(1.0, max(0.0, ($this->ram - 4) / 60));
    }

    private function normalizeStorage(): float
    {
        return min(1.0, max(0.0, ($this->storage - 128) / 1920));
    }

    private function normalizeScreenSize(): float
    {
        return min(1.0, max(0.0, ($this->screen_size - 13) / 4));
    }

    private function normalizePriceRange(): float
    {
        $ranges = ['budget' => 0.0, 'mid-range' => 0.5, 'premium' => 1.0];
        return $ranges[$this->price_range] ?? 0.5;
    }

    private function normalizeWeight(): float
    {
        return min(1.0, max(0.0, ($this->weight - 1) / 2));
    }

    private function normalizeBatteryLife(): float
    {
        return min(1.0, max(0.0, ($this->battery_life - 4) / 16));
    }
}