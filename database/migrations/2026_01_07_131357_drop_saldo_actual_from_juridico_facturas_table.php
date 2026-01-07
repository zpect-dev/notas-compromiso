<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('juridico_facturas', function (Blueprint $table) {
            $table->dropColumn('saldo_actual');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('juridico_facturas', function (Blueprint $table) {
            $table->decimal('saldo_actual', 16, 2)->nullable();
        });
    }
};
