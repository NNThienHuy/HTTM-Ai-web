<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Account extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $primaryKey = 'account_id';
    public $incrementing = true;        // ✅ SỬA
    protected $keyType = 'int';         // ✅ SỬA

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