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
}
