<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_specifications', function (Blueprint $table) {
            $table->id();
            
            // 1. Định nghĩa cột
            $table->unsignedBigInteger('product_id');
            
            $table->string('spec_name');
            $table->string('spec_value');

            // 2. Định nghĩa ràng buộc
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_specifications');
    }
};