<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductFeature extends Model
{
    use HasFactory;

    protected $table = 'product_features';
    protected $primaryKey = 'product_id';
    public $incrementing = false;

    protected $fillable = [
        'product_id',
        'price_final',
        'perf_score',
        'x_price',
        'y_perf',
    ];

    // Quan hệ ngược lại với Product
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
