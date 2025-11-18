<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotaCompromiso extends Model
{
    protected $connection = 'sqlsrv';
    protected $table = 'not_ent';
    protected $primaryKey = 'fact_num';

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'co_cli', 'co_cli');
    }
}
