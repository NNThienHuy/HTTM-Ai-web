<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('laptop_features', function (Blueprint $table) {
            $table->id('feature_id');
            $table->unsignedBigInteger('product_id');
            $table->string('brand', 50)->nullable();
            $table->string('processor', 100)->nullable();
            $table->integer('ram')->nullable();
            $table->integer('storage')->nullable();
            $table->decimal('screen_size', 3, 1)->nullable();
            $table->string('gpu', 100)->nullable();
            $table->string('price_range', 20)->nullable();
            $table->decimal('weight', 4, 2)->nullable();
            $table->integer('battery_life')->nullable();
            $table->string('purpose', 50)->nullable();
            $table->timestamps();

            $table->foreign('product_id')
                  ->references('product_id')
                  ->on('products')
                  ->onDelete('cascade');

            $table->index('brand');
            $table->index('price_range');
            $table->index('purpose');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laptop_features');
    }
};