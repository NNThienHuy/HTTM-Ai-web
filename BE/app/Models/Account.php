<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int $account_id
 * @property string $username
 * @property string $password
 * @property string $email
 * @property string|null $phone
 * @property string $user_type
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $last_login
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Admin|null $admin
 * @property-read \App\Models\Customer|null $customer
 * @property-read mixed $id
 * @property-read mixed $role
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Account newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Account newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Account query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Account whereAccountId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Account whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Account whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Account whereLastLogin($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Account wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Account wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Account whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Account whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Account whereUserType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Account whereUsername($value)
 * @mixin \Eloquent
 */
class Account extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $primaryKey = 'account_id';
    public $incrementing = true;
    protected $keyType = 'int';
    
    // 1. THÊM 'role' VÀO MẢNG APPENDS
    // Giúp JSON trả về có cả 'id' và 'role'
    protected $appends = ['id', 'role','name']; 
    
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
    public function getNameAttribute()
    {
        return $this->customer ? $this->customer->full_name : $this->username;
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