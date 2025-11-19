<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $connection = 'sqlsrv';
    protected $table = 'clientes';
    protected $primaryKey = 'co_cli';
    public $incrementing = false;     // Si es alfanumérico (ej: "CLI001")
    protected $keyType = 'string';    // Tipo de dato de la llave

    // Relación con Vendedor
    public function vendedor()
    {
        // Asumo que la tabla es 'vendedor' y la llave es 'co_ven'
        return $this->belongsTo(Vendedor::class, 'co_ven', 'co_ven');
    }

    // Relación con Segmento
    public function segmento()
    {
        // Asumo que la tabla es 'segmentos' y la llave es 'co_seg'
        return $this->belongsTo(Segmento::class, 'co_seg', 'co_seg');
    }
}
