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
        Schema::create('juridico_archivos', function (Blueprint $table) {
            $table->id();
            $table->string('co_cli')->index(); // Link to client code
            $table->string('solicitud_pago')->nullable();
            $table->string('retiro_mercancia')->nullable();
            $table->string('convenio_pago')->nullable();
            $table->string('frecuencia_convenio')->nullable(); // Assuming file
            $table->string('cantidad_pagar')->nullable(); // Assuming file
            $table->string('cobranza_extrajudicial')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('juridico_archivos');
    }
};
