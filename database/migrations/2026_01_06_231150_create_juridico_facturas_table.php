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
        Schema::create('juridico_facturas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('juridico_cliente_id');
            $table->string('nro_doc');
            $table->decimal('saldo_inicial', 16, 2);
            $table->timestamps();

            $table->foreign('juridico_cliente_id')->references('id')->on('juridico_clientes')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('juridico_facturas');
    }
};
