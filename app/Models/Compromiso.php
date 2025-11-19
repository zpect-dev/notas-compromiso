<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Compromiso extends Model
{
    protected $connection = 'mysql'; 
    protected $table = 'compromiso'; 
    protected $fillable = [
        'fact_num', 
        'comentario', 
        'cumplio',
        'co_cli',
    ];
}
