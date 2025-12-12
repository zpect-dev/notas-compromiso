<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $connection = 'sqlsrv';
    protected $table = 'clientes';
    protected $primaryKey = 'co_cli';
    public $incrementing = false;
    protected $keyType = 'string';

    // Relación con Vendedor
    public function vendedor()
    {
        return $this->belongsTo(Vendedor::class, 'co_ven', 'co_ven');
    }

    // Relación con Segmento
    public function segmento()
    {
        return $this->belongsTo(Segmento::class, 'co_seg', 'co_seg');
    }
}
