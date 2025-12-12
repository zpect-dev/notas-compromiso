<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Movimiento extends Model
{
    protected $connection = 'mysql'; 
    protected $table = 'movimientos'; 
    protected $fillable = [
        'mov_num', 
        'observacion', 
        'aprobado',
        'user_id',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'user_id', 'id');
    }
}
