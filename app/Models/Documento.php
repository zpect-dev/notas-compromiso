<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Documento extends Model
{
    protected $connection = 'sqlsrv';
    protected $table = 'docum_cc'; // O 'sa_ac_cxc'
    protected $primaryKey = 'nro_doc'; // Ojo: Profit usa claves compuestas (co_tipo_doc + nro_doc), pero para lectura esto sirve.
    protected $keyType = 'string';
    public $timestamps = false;

    // Relación con Cliente
    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'co_cli', 'co_cli');
    }

    public function getCodigoAttribute($value)
    {
        return trim($value);
    }
}