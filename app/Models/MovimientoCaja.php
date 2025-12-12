<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MovimientoCaja extends Model
{
    protected $connection = 'sqlsrv';
    protected $table = 'mov_caj';
    protected $primaryKey = 'mov_num';

    protected static function booted()
    {
        static::retrieved(function ($model) {
            $model->codigo = trim($model->codigo); 
        });
    }
    
    public function caja()
    {
        return $this->belongsTo(Caja::class, 'codigo', 'cod_caja');
    }

    public function movimiento()
    {
        return $this->hasOne(Movimiento::class, 'mov_num', 'mov_num');
    }

    public function getCodigoAttribute($value)
    {
        return trim($value);
    }

    public function abonos()
    {
        return $this->hasMany(self::class, 'aux02', 'mov_num');
    }
}