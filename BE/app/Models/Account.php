<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Account extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $primaryKey = 'account_id';
    public $incrementing = true;
    protected $keyType = 'int';
    
    // 1. THÊM 'role' VÀO MẢNG APPENDS
    // Giúp JSON trả về có cả 'id' và 'role'
    protected $appends = ['id', 'role']; 
    
    public function getIdAttribute()
    {
        return $this->account_id; 
    }

    // 2. THÊM HÀM NÀY ĐỂ TẠO CỘT 'role' GIẢ LẬP
    // Frontend Next.js của bạn đang tìm kiếm trường 'role'
    public function getRoleAttribute()
    {
        return $this->user_type; 
    }

    protected $fillable = [
        'username',
        'password',
        'email',
        'phone',
        'user_type',
        'status',
        'last_login'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'last_login' => 'datetime',
    ];

    public function customer()
    {
        return $this->hasOne(Customer::class, 'account_id', 'account_id');
    }

    public function admin()
    {
        return $this->hasOne(Admin::class, 'account_id', 'account_id');
    }

    public function isAdmin(): bool
    {
        return $this->user_type === 'admin';
    }

    public function isCustomer(): bool
    {
        return $this->user_type === 'customer';
    }
}