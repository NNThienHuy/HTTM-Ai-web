<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    if (Schema::hasTable('product_metrics')) return;
    Schema::create('product_metrics', function (Blueprint $t) {
      $t->id();
      $t->foreignId('product_id')->unique()->constrained()->cascadeOnDelete();

      $t->double('impressions_decay')->default(0);
      $t->double('clicks_decay')->default(0);
      $t->double('add_to_cart_decay')->default(0);
      $t->double('purchases_decay')->default(0);

      $t->double('alpha_click')->default(1);
      $t->double('beta_click')->default(1);

      $t->double('alpha_cart')->default(1);
      $t->double('beta_cart')->default(1);
      $t->double('alpha_purchase')->default(1);
      $t->double('beta_purchase')->default(1);

      $t->timestamps();
    });
  }
  public function down(): void { Schema::dropIfExists('product_metrics'); }
};
