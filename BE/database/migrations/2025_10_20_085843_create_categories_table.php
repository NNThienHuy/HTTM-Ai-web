<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            
            // 1. Chỉ định nghĩa cột, chưa thêm ràng buộc
            $table->unsignedBigInteger('parent_id')->nullable(); 
            
            $table->timestamps();

            // === PHẦN 2: THÊM RÀNG BUỘC ===
            // Thêm ràng buộc sau khi tất cả các cột đã được định nghĩa
            $table->foreign('parent_id')
                  ->references('id')
                  ->on('categories') // Tham chiếu đến chính bảng này
                  ->onDelete('set null'); // Nếu danh mục cha bị xóa, set parent_id = null
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};