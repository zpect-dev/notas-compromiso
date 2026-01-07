<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JuridicoFactura extends Model
{
    use HasFactory;

    protected $table = 'juridico_facturas';

    protected $fillable = [
        'juridico_cliente_id',
        'nro_doc',
        'saldo_inicial',
        'co_cli',
        'nombre_cliente',
        'estado',
        'observacion',
    ];

    public function juridicoCliente()
    {
        return $this->belongsTo(JuridicoCliente::class, 'juridico_cliente_id');
    }
}
