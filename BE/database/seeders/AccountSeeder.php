<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AccountSeeder extends Seeder
{
    public function run() {
        for ($i = 1; $i <= 10; $i++) {
            \App\Models\Account::create([
                'username' => "user$i",
                'email' => "user$i@gmail.com",
                'password' => bcrypt('123456'),
                'user_type' => 'customer'
            ]);
        }
    }
}