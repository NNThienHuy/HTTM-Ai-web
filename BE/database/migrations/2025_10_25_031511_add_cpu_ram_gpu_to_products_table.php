<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('products', function (Blueprint $t) {
            // price đã có rồi, KHÔNG thêm lại
            if (!Schema::hasColumn('products','cpu')) $t->string('cpu', 255)->nullable()->after('sale_price');
            if (!Schema::hasColumn('products','ram')) $t->string('ram', 100)->nullable()->after('cpu');
            if (!Schema::hasColumn('products','gpu')) $t->string('gpu', 255)->nullable()->after('ram');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $t) {
            $t->dropColumn(['cpu','ram','gpu']);
        });
    }
};
