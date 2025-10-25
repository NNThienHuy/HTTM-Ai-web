<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    if (Schema::hasTable('product_events')) return;
    Schema::create('product_events', function (Blueprint $t) {
      $t->id();
      $t->foreignId('product_id')->constrained()->cascadeOnDelete();
      $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
      $t->string('session_id')->nullable();
      $t->enum('event',['view','click','add_to_cart','purchase']);
      $t->unsignedInteger('dwell_ms')->nullable();
      $t->timestamps();
      $t->index(['product_id','event']);
      $t->index(['user_id','event']);
      $t->index('created_at');
    });
  }
  public function down(): void { Schema::dropIfExists('product_events'); }
};
