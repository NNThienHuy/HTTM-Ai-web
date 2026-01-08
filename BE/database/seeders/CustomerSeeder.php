<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Account;
use App\Models\Customer;

class CustomerSeeder extends Seeder {
    public function run() {
        $accounts = Account::where('user_type', 'customer')->get();
        foreach ($accounts as $acc) {
            Customer::updateOrCreate(
                ['account_id' => $acc->account_id],
                ['full_name' => 'Khách hàng ' . $acc->username]
            );
        }
    }
}