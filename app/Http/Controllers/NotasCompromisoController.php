<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\NotaCompromiso;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Inertia;

class NotasCompromisoController extends Controller
{
    public function index(Request $request){
        $notas = NotaCompromiso::select('fact_num', 'comentario', 'fec_emis', 'co_cli')
            ->with('cliente:co_cli,cli_des,co_seg,co_ven')
            ->where('comentario', 'like', '%alcabala%')
            ->orderBy('fact_num', 'desc')
            ->get()
            ->map(function($nota){

                $coleccion = Str::of($nota->comentario)->explode('-');
                $fecha_pagar = Carbon::createFromFormat('d/m/Y', $coleccion[1]);
                $fecha_emis = Carbon::parse($nota->fec_emis);

                $dias_restantes = $fecha_pagar->diff($fecha_emis, false);

                return [
                    'co_cli' => trim($nota->cliente->co_cli),
                    'cli_des' => trim($nota->cliente->cli_des),
                    'co_seg' => trim($nota->cliente->co_seg),
                    'co_ven' => trim($nota->cliente->co_ven),
                    'fact_num' => $nota->fact_num,
                    'fec_emis' => $fecha_emis->format('d-m-Y'),
                    'fec_pagar' => $fecha_pagar->format('d-m-Y'),
                    'cant_pagar' => $coleccion[2],
                    'dias_restantes' => $dias_restantes->days,
                ];
            });

        return Inertia::render('Home', [
            'notas' => $notas
        ]);
    }
}
