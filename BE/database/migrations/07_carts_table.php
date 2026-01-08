<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carts', function (Blueprint $table) {
            $table->id('cart_id');
            $table->unsignedBigInteger('customer_id')->unique();
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->timestamps();

            $table->foreign('customer_id')
                  ->references('customer_id')
                  ->on('customers')
                  ->onDelete('cascade');

            $table->index('customer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};