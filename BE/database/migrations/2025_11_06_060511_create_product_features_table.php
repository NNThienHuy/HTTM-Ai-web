<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('product_features', function (Blueprint $table) {
            // Khóa chính cũng là product_id (1-1 với bảng products)
            $table->unsignedBigInteger('product_id')->primary();

            // Giá cuối cùng (price hoặc sale_price)
            $table->unsignedBigInteger('price_final');

            // Điểm hiệu năng (0-100)
            $table->float('perf_score')->default(0);

            // Hai toạ độ chuẩn hoá cho KNN (0..1)
            $table->float('x_price')->default(0);
            $table->float('y_perf')->default(0);

            $table->timestamps();

            // Liên kết tới bảng products
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_features');
    }
};
