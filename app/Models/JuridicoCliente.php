<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JuridicoCliente extends Model
{
    use HasFactory;

    protected $table = 'juridico_clientes';

    protected $fillable = [
        'co_cli',
        'saldo',
    ];

    protected $casts = [
        'saldo' => 'decimal:2',
    ];

    public function juridicoFacturas()
    {
        return $this->hasMany(JuridicoFactura::class, 'juridico_cliente_id');
    }
}
