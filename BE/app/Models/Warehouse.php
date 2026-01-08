<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Warehouse extends Model
{
    protected $primaryKey = 'warehouse_id';
    protected $fillable = ['location', 'contact_number'];

    public function inventoryItems(): HasMany
    {
        // Liên kết với bảng 13 inventoru_items
        return $this->hasMany(InventoryItem::class, 'warehouse_id', 'warehouse_id');
    }
}