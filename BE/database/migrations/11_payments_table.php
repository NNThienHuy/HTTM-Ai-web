<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id('payment_id');
            $table->unsignedBigInteger('order_id')->unique();
            $table->decimal('amount', 15, 2);
            $table->enum('payment_method', ['vnpay', 'cod', 'bank_transfer']);
            $table->timestamp('payment_date')->nullable();
            $table->enum('status', ['pending', 'success', 'failed', 'refunded'])
                  ->default('pending');
            $table->string('transaction_id', 100)->nullable();
            $table->string('gateway', 50)->nullable();
            $table->timestamps();

            $table->foreign('order_id')
                  ->references('order_id')
                  ->on('orders')
                  ->onDelete('cascade');

            $table->index('status');
            $table->index('transaction_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};