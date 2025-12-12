<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RenglonCobro extends Model
{
    protected $connection = 'sqlsrv';
    protected $table = 'reng_cob'; // O 'sa_ac_cxc'
    protected $primaryKey = 'cob_num'; // Ojo: Profit usa claves compuestas (co_tipo_doc + nro_doc), pero para lectura esto sirve.
    protected $keyType = 'string';
    public $timestamps = false;
}
