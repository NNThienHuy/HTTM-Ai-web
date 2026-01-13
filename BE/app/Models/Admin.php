<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Admin extends Model
{
    // 1. KHAI BÁO KHÓA CHÍNH (QUAN TRỌNG NHẤT)
    protected $primaryKey = 'admin_id'; // <--- Nếu thiếu dòng này, lệnh delete() sẽ bị lỗi
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'account_id',
        'role',
        'permissions'
    ];

    public function account()
    {
        return $this->belongsTo(Account::class, 'account_id', 'account_id');
    }
}