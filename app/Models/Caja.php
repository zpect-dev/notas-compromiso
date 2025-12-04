<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Caja extends Model
{
    protected $connection = 'sqlsrv';
    protected $table = 'cajas'; 
    protected $primaryKey = 'cod_caja';
    
    // 1. OBLIGATORIO: Decirle que el ID es String y no autoincrementable
    public $incrementing = false;
    protected $keyType = 'string';

    // 2. OBLIGATORIO: Quitar espacios al recuperar el registro
    protected static function booted()
    {
        static::retrieved(function ($model) {
            // Esto es vital: Limpia el ID de la caja para que coincida con el movimiento
            $model->cod_caja = trim($model->cod_caja);
            $model->setAttribute('cod_caja', trim($model->cod_caja));
        });
    }
}