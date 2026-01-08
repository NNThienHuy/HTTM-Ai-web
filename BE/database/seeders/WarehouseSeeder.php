<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WarehouseSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('warehouses')->insert([
            [
                'name' => 'Kho Tổng Miền Nam',
                'location' => 'TP. Hồ Chí Minh',
                'address' => 'Quận Thủ Đức, TP.HCM',
                'capacity' => 1000,
                'status' => 'active',
                'created_at' => now(),
            ],
            [
                'name' => 'Kho Miền Bắc',
                'location' => 'Hà Nội',
                'address' => 'Quận Long Biên, Hà Nội',
                'capacity' => 800,
                'status' => 'active',
                'created_at' => now(),
            ]
        ]);
    }
}