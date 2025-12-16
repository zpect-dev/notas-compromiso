<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JuridicoArchivo extends Model
{
    use HasFactory;

    protected $table = 'juridico_archivos';

    protected $fillable = [
        'co_cli',
        'solicitud_pago',
        'retiro_mercancia',
        'convenio_pago',
        'frecuencia_convenio',
        'cantidad_pagar',
        'cobranza_extrajudicial',
    ];
}
