<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'description'];
    // ==========================================
    // == ĐỊNH NGHĨA RELATIONSHIPS
    // ==========================================

    /**
     * Lấy danh mục Cha (N-1)
     */
    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    /**
     * Lấy tất cả danh mục Con (1-N)
     */
    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }
}