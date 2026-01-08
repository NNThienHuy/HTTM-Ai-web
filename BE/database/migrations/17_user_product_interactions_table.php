<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_product_interactions', function (Blueprint $table) {
            $table->id('interaction_id');
            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('product_id');
            $table->enum('interaction_type', ['view', 'cart', 'purchase', 'rating']);
            $table->decimal('interaction_value', 3, 2)->default(1.0);
            $table->timestamp('interaction_date')->useCurrent();
            $table->timestamps();

            $table->foreign('customer_id')
                  ->references('customer_id')
                  ->on('customers')
                  ->onDelete('cascade');

            $table->foreign('product_id')
                  ->references('product_id')
                  ->on('products')
                  ->onDelete('cascade');

            $table->index(['customer_id', 'interaction_date']);
            $table->index(['product_id', 'interaction_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_product_interactions');
    }
};