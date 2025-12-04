<?php

namespace App\Http\Controllers;

use App\Models\Movimiento;
use App\Models\MovimientoCaja;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MovimientosCajaController extends Controller
{
    public function index(Request $request) {
        $movimientos = MovimientoCaja::select('mov_num', 'codigo', 'tipo_op', 'monto_d', 'descrip', 'campo4', 'fecha')
            ->with([
                'movimiento' => function($query) {
                    $query->select('mov_num', 'observacion', 'aprobado', 'user_id', 'created_at');
                },
                // 'movimiento.usuario' => function($query) {
                //     $query->select('id_u', 'usuario');
                // },
                'caja' => function($query) {
                    $query->select('cod_caja', 'descrip');
                }
            ])
            ->where('origen', "CAJ")
            ->where('tipo_op', "E")
            ->whereNotIn('mov_num', [
                '72001449', 
                '72000331', 
                '72000236', 
                '603302', 
                '260611', 
                '225104'
            ])
            ->whereDate('fecha', '>=', '2025-11-01')
            ->orderBy('mov_num', 'desc')
            ->get();

        return Inertia::render('Caja', [
            'movimientos' => $movimientos,
        ]);
    }

    public function store(Request $request, MovimientoCaja $movimiento) {
        $request->validate([
            'observacion' => ['nullable', 'string'],
            'aprobado' => ['required', 'boolean']
        ]);

        Movimiento::create([
            'user_id' => 1,
            'mov_num' => $movimiento->mov_num,
            'observacion' => $request->observacion ?? 'asd',
            'aprobado' => $request->aprobado,
        ]);

        return back();
    }
}
