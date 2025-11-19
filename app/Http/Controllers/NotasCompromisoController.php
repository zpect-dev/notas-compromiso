<?php

namespace App\Http\Controllers;

use App\Models\Compromiso;
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
            ->with('compromiso:fact_num,comentario,cumplio,created_at')
            ->where('comentario', 'like', '%alcabala%')
            ->orderBy('fact_num', 'desc')
            ->get()
            ->map(function($nota){

                $fec_pagar_visual = 'Formato Inválido';
                $monto_pagar = '0';
                $dias_restantes = 0;
                
                $compromiso = $nota->compromiso; 
                
                try {
                    $coleccion = Str::of($nota->comentario)->explode('-');

                    if(count($coleccion) >= 3) {
                        $fecha_pagar = Carbon::createFromFormat('d/m/Y', trim($coleccion[1]))->startOfDay();
                        
                        $fec_pagar_visual = $fecha_pagar->format('d-m-Y');
                        $monto_pagar = trim($coleccion[2]);

                        if ($compromiso && $compromiso->cumplio) {
                            $fecha_comparacion = Carbon::parse($compromiso->created_at)->startOfDay();
                        } else {
                            $fecha_comparacion = Carbon::today(); 
                        }

                        $dias_restantes = (int) $fecha_comparacion->diffInDays($fecha_pagar, false);
                    }
                } catch (\Throwable $th) {

                }

                return [
                    'co_cli' => trim($nota->cliente->co_cli),
                    'cli_des' => trim($nota->cliente->cli_des),
                    'co_seg' => trim($nota->cliente->co_seg),
                    'co_ven' => trim($nota->cliente->co_ven),
                    'fact_num' => $nota->fact_num,
                    
                    'fec_pagar' => $fec_pagar_visual,
                    'cant_pagar' => $monto_pagar,
                    'dias_restantes' => $dias_restantes,
                    
                    'cumplio' => $compromiso?->cumplio ?? null, 
                    'comentario' => $compromiso?->comentario ?? null,
                ];
            });

        return Inertia::render('Home', [
            'notas' => $notas
        ]);
    }

    public function store(Request $request, NotaCompromiso $nota) {
        $request->validate([
            'comentario' => ['nullable', 'string'],
            'cumplio' => ['required', 'boolean']
        ]);

        Compromiso::create([
            'co_cli' => $nota->co_cli,
            'fact_num' => $nota->fact_num,
            'comentario' => $request->comentario,
            'cumplio' => $request->cumplio,
        ]);

        return back();
    }
}
