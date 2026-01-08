<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LaptopFeature extends Model
{
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