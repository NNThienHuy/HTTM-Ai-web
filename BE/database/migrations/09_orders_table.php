<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id('order_id');
            $table->unsignedBigInteger('customer_id');
            $table->timestamp('order_date')->useCurrent();
            $table->enum('status', [
                'pending', 
                'confirmed', 
                'processing', 
                'shipping', 
                'delivered', 
                'cancelled'
            ])->default('pending');
            $table->decimal('total_amount', 15, 2);
            $table->string('shipping_address');
            $table->string('shipping_city', 50)->nullable();
            $table->string('shipping_district', 50)->nullable();
            $table->string('tracking_number', 100)->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->foreign('customer_id')
                  ->references('customer_id')
                  ->on('customers')
                  ->onDelete('restrict');

            $table->index('customer_id');
            $table->index('status');
            $table->index('order_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};