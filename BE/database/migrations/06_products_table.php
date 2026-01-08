<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id('product_id');
            $table->string('name', 200);
            $table->text('description')->nullable();
            $table->decimal('price', 15, 2);
            $table->unsignedBigInteger('category_id')->nullable();
            $table->string('image_url', 500)->nullable();
            $table->integer('stock_quantity')->default(0);
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('views')->default(0);
            $table->timestamps();

            $table->foreign('category_id')
                  ->references('category_id')
                  ->on('product_categories')
                  ->onDelete('set null');

            // Indexes
            $table->index('name');
            $table->index('category_id');
            $table->index('price');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};