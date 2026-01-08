<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guests', function (Blueprint $table) {
            $table->string('session_id', 50)->primary();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('visit_time')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guests');
    }
};