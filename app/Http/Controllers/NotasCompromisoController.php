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
    public function index(Request $request)
    {
        $notas = NotaCompromiso::select('fact_num', 'comentario', 'fec_emis', 'co_cli')
            ->with([
                'cliente:co_cli,cli_des,co_seg,co_ven',
                'cliente.vendedor:co_ven,ven_des',
                'cliente.segmento:co_seg,seg_des'
            ])
            ->with('compromiso:fact_num,comentario,cumplio,created_at')
            ->where('comentario', 'like', '%alcabala%')
            ->orderBy('fact_num', 'desc')
            ->get()
            ->map(function ($nota) {

                // Valores por defecto
                $fec_pagar_visual = 'Formato Inválido';
                $monto_pagar = '0';
                $dias_restantes = 0;

                // 1. Intentamos extraer los datos con la función inteligente
                $datosExtraidos = $this->extraerDatosAlcabala($nota->comentario);

                if ($datosExtraidos) {
                    $fecha_pagar = $datosExtraidos['fecha_carbon'];
                    $monto_pagar = $datosExtraidos['monto'];
                    $fec_pagar_visual = $fecha_pagar->format('d-m-Y');

                    // 2. Lógica de comparación de fechas
                    $compromiso = $nota->compromiso;

                    if ($compromiso && $compromiso->cumplio) {
                        $fecha_comparacion = Carbon::parse($compromiso->created_at)->startOfDay();
                    } else {
                        $fecha_comparacion = Carbon::today();
                    }

                    $dias_restantes = (int) $fecha_comparacion->diffInDays($fecha_pagar, false);
                }

                return [
                    'co_cli' => trim($nota->cliente->co_cli),
                    'cli_des' => trim($nota->cliente->cli_des),
                    'co_seg' => trim($nota->cliente->co_seg),
                    'co_ven' => trim($nota->cliente->co_ven),
                    'fact_num' => $nota->fact_num,

                    'fec_pagar' => $fec_pagar_visual,
                    'cant_pagar' => (float)$monto_pagar, // Formateamos bonito para el front
                    'dias_restantes' => $dias_restantes,

                    'cumplio' => $nota->compromiso?->cumplio ?? null,
                    'comentario' => $nota->compromiso?->comentario ?? null,

                    'segmento' => trim($nota->cliente->segmento?->seg_des),
                    'vendedor' => trim($nota->cliente->vendedor?->ven_des),
                ];
            });

        return Inertia::render('Home', [
            'notas' => $notas
        ]);
    }

    public function store(Request $request, NotaCompromiso $nota)
    {
        if (! $request->session()->has('usuario')) {
            return redirect('/login');
        }
        $request->validate([
            'comentario' => ['nullable', 'string'],
            'cumplio' => ['required', 'integer', 'in:0,1,2'],
        ]);

        Compromiso::updateOrCreate(
            [
                'co_cli' => $nota->co_cli,
                'fact_num' => $nota->fact_num,
            ],
            [
                'comentario' => $request->comentario,
                'cumplio' => $request->cumplio,
            ]
        );

        return back();
    }

    // ---------------------------------------------------
    // FUNCIONES AUXILIARES (Logic Helpers)
    // ---------------------------------------------------

    /**
     * Procesa el string sucio y devuelve fecha (Carbon) y monto (float)
     */
    private function extraerDatosAlcabala($input)
    {
        // Regex robusto: Acepta espacios, guiones, barras, comas y puntos.
        $regex = '/alcabala[\s\W]+(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})[\s\W]+([\d\.,]+)/i';

        if (preg_match($regex, trim($input), $matches)) {
            try {
                // Normalizamos fecha: cambiamos "/" por "-" para asegurar formato d-m-Y
                $fechaString = str_replace('/', '-', $matches[1]);
                $fechaCarbon = Carbon::parse($fechaString)->startOfDay();

                // Limpiamos el monto
                $montoFloat = $this->limpiarMonto($matches[2]);

                return [
                    'fecha_carbon' => $fechaCarbon,
                    'monto' => $montoFloat
                ];
            } catch (\Exception $e) {
                // Si la fecha es invalida (ej: 45-20-2025) retornamos null
                return null;
            }
        }

        return null;
    }

    /**
     * Convierte strings como "1.500,50" o "1,500.50" en floats válidos
     */
    private function limpiarMonto($valor)
    {
        // Caso simple: 5000
        if (strpos($valor, '.') === false && strpos($valor, ',') === false) {
            return (float) $valor;
        }

        // Caso Mixto (tiene punto y coma): Decidir cuál es el decimal
        if (strpos($valor, '.') !== false && strpos($valor, ',') !== false) {
            $lastDot = strrpos($valor, '.');
            $lastComma = strrpos($valor, ',');
            
            // Si la coma está al final (Euro/Latam): 1.500,50
            if ($lastComma > $lastDot) {
                $valor = str_replace('.', '', $valor); // Quitar miles
                $valor = str_replace(',', '.', $valor); // Coma a punto
            } else {
                // Gringo: 1,500.50
                $valor = str_replace(',', '', $valor);
            }
        } 
        // Solo comas (50,5 o 5,000)
        elseif (strpos($valor, ',') !== false) {
            $valor = str_replace(',', '.', $valor);
        }
        // Solo puntos (5.000 o 5.5)
        else {
            $partes = explode('.', $valor);
            // Si el último grupo son 3 dígitos exactos (5.000), asumimos miles
            if (strlen(end($partes)) === 3) {
                $valor = str_replace('.', '', $valor);
            }
        }

        return (float) $valor;
    }
}