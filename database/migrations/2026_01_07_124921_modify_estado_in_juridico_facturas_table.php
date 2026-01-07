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
            $table->tinyInteger('estado')->default(0)->comment('0: Pendiente, 1: Recuperado, 2: Pagado')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('juridico_facturas', function (Blueprint $table) {
            //
        });
    }
};
