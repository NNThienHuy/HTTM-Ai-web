<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_behaviors', function (Blueprint $table) {
            $table->id('behavior_id');
            $table->unsignedBigInteger('customer_id')->unique();
            $table->json('viewed_products')->nullable();
            $table->json('purchase_history')->nullable();
            $table->json('ratings')->nullable();
            $table->timestamps();

            $table->foreign('customer_id')
                  ->references('customer_id')
                  ->on('customers')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_behaviors');
    }
};