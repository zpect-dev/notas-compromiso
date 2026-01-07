<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Documento;
use App\Models\Cliente;
use App\Models\RenglonCobro;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Services\Multimedia;
use App\Models\JuridicoArchivo;
use App\Models\JuridicoFactura;

class JuridicoController extends Controller
{
    public function index(Request $request) {
        // 1. Build Subquery for Metrics (Aggregated by Client)
        // This calculates totals ONCE per client instead of per row
        $metricsQuery = Documento::select('co_cli')
            ->selectRaw('SUM(saldo / tasa) as saldo_por_cobrar')
            ->selectRaw('MAX(DATEDIFF(day, fec_venc, GETDATE())) as morosidad_maxima')
            ->where('tipo_doc', 'FACT')
            ->where('anulado', 0)
            ->where('saldo', '>', 0)
            ->groupBy('co_cli');

        // 2. Main Query
        $query = Cliente::query()
            ->where('inactivo', 0)
            ->leftJoinSub($metricsQuery, 'metrics', function ($join) {
                $join->on('clientes.co_cli', '=', 'metrics.co_cli');
            })
            ->select([
                'clientes.co_cli as codigo',
                'clientes.cli_des as descripcion',
                'clientes.rif',
                DB::raw('ISNULL(metrics.saldo_por_cobrar, 0) as saldo_por_cobrar'),
                DB::raw('ISNULL(metrics.morosidad_maxima, 0) as morosidad_maxima')
            ]);
        
        $user = $request->session()->get('juridico_user');
        
        if (!$user || !$user->is_admin) {
             // Si es usuario normal, filtrar por la tabla juridico_clientes
             $clientesJuridico = \App\Models\JuridicoCliente::pluck('co_cli');
             $query->whereIn('clientes.co_cli', $clientesJuridico);
        } else {
             // Si es admin, mostrar solo segmentos específicos
             $segmentosPermitidos = [
                 '21', '07', '31', '19', '05', '48', '37', '51', '09', '50', 
                 '49', '22', '06', '08', '20', '27', '02', '04', '15', '14', 
                 '03', '23', '01', '47', '40', '11', '38', '39'
            ];
             $query->whereIn('clientes.co_seg', $segmentosPermitidos);
        }

        // Apply Search
        if ($request->filled('search')) {
             $search = $request->search;
             $query->where(function($q) use ($search) {
                 $q->where('clientes.co_cli', 'like', "%{$search}%")
                   ->orWhere('clientes.cli_des', 'like', "%{$search}%")
                   ->orWhere('clientes.rif', 'like', "%{$search}%");
             });
        }

        // Apply Status Filter (Using the pre-calculated metrics columns)
        if ($request->filled('status') && $request->status !== 'TODOS') {
            switch ($request->status) {
                case 'PERDIDA_TOTAL':
                    $query->where('metrics.saldo_por_cobrar', '>', 2000)
                          ->where('metrics.morosidad_maxima', '>', 60);
                    break;
                case 'CRITICO':
                    $query->where('metrics.morosidad_maxima', '>', 60)
                          ->where(function($q) {
                              $q->whereNull('metrics.saldo_por_cobrar')
                                ->orWhere('metrics.saldo_por_cobrar', '<=', 2000);
                          });
                    break;
                case 'ADVERTENCIA':
                     $query->whereBetween('metrics.morosidad_maxima', [30, 60]);
                    break;
                case 'OPORTUNIDAD':
                    $query->where('metrics.saldo_por_cobrar', '>', 2000)
                          ->where('metrics.morosidad_maxima', '<', 30);
                    break;
                case 'SANO':
                     // Sano = Not in any of the above categories
                     // Low Balance (<2000) AND Low Mora (<30)
                     $query->where(function($q) {
                         $q->where(function($sub) {
                             $sub->whereNull('metrics.morosidad_maxima')
                                 ->orWhere('metrics.morosidad_maxima', '<', 30);
                         })->where(function($sub) {
                             $sub->whereNull('metrics.saldo_por_cobrar')
                                 ->orWhere('metrics.saldo_por_cobrar', '<=', 2000);
                         });
                     });
                    break;
            }
        }
        
        $clientes = $query->orderBy('clientes.cli_des', 'asc')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Juridico/Index', [
            'clientes' => $clientes,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function enviados(Request $request) {
        // 1. Build Subquery for Metrics (Aggregated by Client)
        $metricsQuery = Documento::select('co_cli')
            ->selectRaw('SUM(saldo / tasa) as saldo_por_cobrar')
            ->selectRaw('MAX(DATEDIFF(day, fec_venc, GETDATE())) as morosidad_maxima')
            ->where('tipo_doc', 'FACT')
            ->where('anulado', 0)
            ->where('saldo', '>', 0)
            ->groupBy('co_cli');

        // 2. Main Query - Get sent clients from MySQL and filter in SQL Server
        $clientesEnviados = \App\Models\JuridicoCliente::pluck('co_cli');
        
        $query = Cliente::query()
            ->whereIn('clientes.co_cli', $clientesEnviados)
            ->leftJoinSub($metricsQuery, 'metrics', function ($join) {
                $join->on('clientes.co_cli', '=', 'metrics.co_cli');
            })
            ->select([
                'clientes.co_cli as codigo',
                'clientes.cli_des as descripcion',
                'clientes.rif',
                DB::raw('ISNULL(metrics.saldo_por_cobrar, 0) as saldo_por_cobrar'),
                DB::raw('ISNULL(metrics.morosidad_maxima, 0) as morosidad_maxima')
            ]);
        
        // Apply Search
        if ($request->filled('search')) {
             $search = $request->search;
             $query->where(function($q) use ($search) {
                 $q->where('clientes.co_cli', 'like', "%{$search}%")
                   ->orWhere('clientes.cli_des', 'like', "%{$search}%")
                   ->orWhere('clientes.rif', 'like', "%{$search}%");
             });
        }

        // Apply Status Filter
        if ($request->filled('status') && $request->status !== 'TODOS') {
             switch ($request->status) {
                case 'PERDIDA_TOTAL':
                    $query->where('metrics.saldo_por_cobrar', '>', 2000)
                          ->where('metrics.morosidad_maxima', '>', 60);
                    break;
                case 'CRITICO':
                    $query->where('metrics.morosidad_maxima', '>', 60)
                          ->where(function($q) {
                              $q->whereNull('metrics.saldo_por_cobrar')
                                ->orWhere('metrics.saldo_por_cobrar', '<=', 2000);
                          });
                    break;
                case 'ADVERTENCIA':
                     $query->whereBetween('metrics.morosidad_maxima', [30, 60]);
                    break;
                case 'OPORTUNIDAD':
                    $query->where('metrics.saldo_por_cobrar', '>', 2000)
                          ->where('metrics.morosidad_maxima', '<', 30);
                    break;
                case 'SANO':
                     $query->where(function($q) {
                         $q->where(function($sub) {
                             $sub->whereNull('metrics.morosidad_maxima')
                                 ->orWhere('metrics.morosidad_maxima', '<', 30);
                         })->where(function($sub) {
                             $sub->whereNull('metrics.saldo_por_cobrar')
                                 ->orWhere('metrics.saldo_por_cobrar', '<=', 2000);
                         });
                     });
                    break;
            }
        }

        $clientes = $query->orderBy('clientes.cli_des', 'asc')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Juridico/Enviados', [
            'clientes' => $clientes,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function enviar(Request $request) {
        $request->validate([
            'co_cli' => 'required|string',
            'saldo' => 'required|numeric'
        ]);

        $juridicoCliente = \App\Models\JuridicoCliente::updateOrCreate(
            ['co_cli' => $request->co_cli],
            ['saldo' => $request->saldo]
        );

        $facturas = Documento::where('co_cli', $request->co_cli)
            ->where('tipo_doc', 'FACT')
            ->where('saldo', '>', 0)
            ->where('anulado', 0)
            ->get();

        $cliente = Cliente::where('co_cli', $request->co_cli)->firstOrFail();

        foreach ($facturas as $factura) {
            JuridicoFactura::updateOrCreate(
                [
                    'juridico_cliente_id' => $juridicoCliente->id,
                    'nro_doc' => $factura->nro_doc
                ],
                [
                    'saldo_inicial' => $factura->saldo / $factura->tasa,
                    'co_cli' => $request->co_cli,
                    'nombre_cliente' => trim($cliente->cli_des)
                ]
            );
        }

        return back()->with('success', 'Cliente enviado a Jurídico correctamente');
    }

    public function show(Request $request, $clienteId) {
        // Verificar cliente
        $cliente = Cliente::where('co_cli', $clienteId)->firstOrFail();

        // Obtener archivos
        $archivosRegistro = JuridicoArchivo::firstOrCreate(
            ['co_cli' => $clienteId],
            []
        );

        $camposArchivos = [
            'solicitud_pago',
            'retiro_mercancia',
            'convenio_pago',
            'frecuencia_convenio',
            'cantidad_pagar',
            'cobranza_extrajudicial'
        ];

        $archivos = [];
        $trimmedClienteId = trim($clienteId);

        foreach ($camposArchivos as $campo) {
            $filename = $archivosRegistro->$campo;
            if ($filename) {
                // Construir URL: /storage/uploads/juridico/{cliente}/filename
                $archivos[$campo] = asset("storage/uploads/juridico/{$trimmedClienteId}/{$filename}");
            } else {
                $archivos[$campo] = null;
            }
        }

        // Obtener JuridicoCliente para snapshots
        $juridicoCliente = \App\Models\JuridicoCliente::where('co_cli', $clienteId)->first();

        // Consulta Facturas (SQL Server)
        $facturas = Documento::query()
            ->select([
                // Campos simples
                'docum_cc.co_cli as codigo',
                'docum_cc.nro_doc as nro_factura',
                'docum_cc.fec_emis as emision',
                'docum_cc.fec_venc as vencimiento',
                'docum_cc.observa as observacion',
                'segmento.seg_des as nombre_segmento',
                
                // Calculos
                DB::raw('(docum_cc.monto_net / docum_cc.tasa) as monto_factura'),
                // Saldo inicial se inyectará manualmente
                DB::raw('(docum_cc.saldo / docum_cc.tasa) as saldo_actual'),
                
                // Campos de relación
                DB::raw("RTRIM(clientes.cli_des) as cliente"),

                // Morosidad
                DB::raw("
                    CASE 
                        WHEN (docum_cc.saldo / docum_cc.tasa) <= 0.10 THEN 
                            DATEDIFF(day, docum_cc.fec_venc, ISNULL((
                                SELECT TOP 1 c.fec_cob 
                                FROM reng_cob rc 
                                JOIN cobros c ON rc.cob_num = c.cob_num 
                                WHERE rc.doc_num = docum_cc.nro_doc 
                                AND rc.tp_doc_cob = 'FACT' 
                                ORDER BY c.fec_cob DESC
                            ), docum_cc.fec_emis))
                        ELSE 
                            DATEDIFF(day, docum_cc.fec_venc, GETDATE()) 
                    END as dias_morosidad
                "),
                
                // Estado
                DB::raw("CASE WHEN (docum_cc.saldo / docum_cc.tasa) <= 0.10 THEN 'RECUPERADO' ELSE 'PENDIENTE' END as estado_recuperacion"),

                // Subconsultas Eloquent
                'ultimo_cobro_fecha' => RenglonCobro::select('cobros.fec_cob')
                    ->join('cobros', 'reng_cob.cob_num', '=', 'cobros.cob_num')
                    ->whereColumn('reng_cob.doc_num', 'docum_cc.nro_doc') 
                    ->where('reng_cob.tp_doc_cob', 'FACT')
                    ->latest('cobros.fec_cob')
                    ->limit(1),

                'ultimo_cobro_monto' => RenglonCobro::selectRaw('reng_cob.neto / docum_cc.tasa') 
                    ->join('cobros', 'reng_cob.cob_num', '=', 'cobros.cob_num')
                    ->whereColumn('reng_cob.doc_num', 'docum_cc.nro_doc')
                    ->where('reng_cob.tp_doc_cob', 'FACT')
                    ->latest('cobros.fec_cob')
                    ->limit(1)
            ])
            ->join('clientes', 'docum_cc.co_cli', '=', 'clientes.co_cli')
            ->leftJoin('segmento', 'clientes.co_seg', '=', 'segmento.co_seg')
            ->where('docum_cc.tipo_doc', 'FACT') 
            ->where('docum_cc.anulado', 0) 
            ->where('docum_cc.co_cli', $clienteId) 
            ->orderBy('docum_cc.fec_emis', 'desc')
            ->get();

        // Obtener snapshots y mergear
        $snapshots = [];
        if ($juridicoCliente) {
            $snapshots = JuridicoFactura::where('juridico_cliente_id', $juridicoCliente->id)
                ->whereIn('nro_doc', $facturas->pluck('nro_factura'))
                ->get()
                ->keyBy('nro_doc');
        }

        $facturas->transform(function ($factura) use ($snapshots) {
            // Asignar saldo_inicial del snapshot, o null
            // Nota: las facturas pueden tener espacios en blanco al final en SQL Server
            $nroDoc = trim($factura->nro_factura);
            $snapshot = $snapshots[$nroDoc] ?? null;

            $factura->saldo_inicial = $snapshot->saldo_inicial ?? null; 
            $factura->estado_manual = $snapshot->estado ?? 0;
            $factura->observacion_manual = $snapshot->observacion ?? null;
            return $factura;
        });

        return Inertia::render('Juridico/Show', [
            'cliente' => [
                'codigo' => $cliente->co_cli,
                'descripcion' => $cliente->cli_des,
                'rif' => $cliente->rif
            ],
            'facturas' => $facturas,
            'archivos' => $archivos
        ]);
    }

    public function marcarRecuperado(Request $request) {
        $request->validate([
            'nro_doc' => 'required|string',
            'co_cli' => 'required|string',
            'observacion' => 'nullable|string'
        ]);

        $clienteId = $request->co_cli;
        $juridicoCliente = \App\Models\JuridicoCliente::where('co_cli', $clienteId)->firstOrFail();

        JuridicoFactura::updateOrCreate(
             [
                'juridico_cliente_id' => $juridicoCliente->id,
                'nro_doc' => $request->nro_doc
            ],
            [
                'estado' => 1,
                'observacion' => $request->observacion
            ]
        );

        return back()->with('success', 'Factura marcada como recuperada');
    }

    public function marcarPagado(Request $request) {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:juridico_facturas,id'
        ]);

        JuridicoFactura::whereIn('id', $request->ids)->update(['estado' => 2]);

        return back()->with('success', 'Facturas marcadas como pagadas');
    }

    public function subirArchivo(Request $request, $clienteId) {
        $request->validate([
            'archivo' => 'required|file|mimes:pdf|max:102400', // Max 10MB
            'tipo' => 'required|in:solicitud_pago,retiro_mercancia,convenio_pago,frecuencia_convenio,cantidad_pagar,cobranza_extrajudicial'
        ]);

        $tipo = $request->input('tipo');
        $file = $request->file('archivo');

        $multimedia = new Multimedia();
        $nameImage = $multimedia->guardarArchivoPdf($file, 'juridico', trim($clienteId));
        
        if (!$nameImage) {
            return back()->with('error', 'Error al subir el archivo');
        }

        JuridicoArchivo::updateOrCreate(
            ['co_cli' => $clienteId],
            [$tipo => $nameImage]
        );

        return back()->with('success', 'Archivo subido correctamente');
    }

    public function recuperadas(Request $request) {
        $user = $request->session()->get('juridico_user');
        
        if (!$user || !$user->is_admin) {
             return redirect()->route('juridico.index')->with('error', 'Acceso denegado');
        }

        $facturas = JuridicoFactura::whereIn('estado', [1, 2]) // 1 = Recuperado, 2 = Pagado
            ->orderBy('updated_at', 'desc')
            ->get();

        // Obtener nros de factura y clientes
        $nrosFactura = $facturas->pluck('nro_doc')->toArray();
        $coClients = $facturas->pluck('co_cli')->unique()->toArray();

        // Consultar Documentos en SQL Server para obtener saldo actual en tiempo real
        if (!empty($nrosFactura)) {
            $documentos = \App\Models\Documento::whereIn('nro_doc', $nrosFactura)
                ->where('tipo_doc', 'FACT')
                ->select(['nro_doc', 'saldo', 'tasa'])
                ->get()
                ->keyBy(function ($item) {
                     return trim($item->nro_doc);
                });
        } else {
            $documentos = collect();
        }

        // Consultar Segmentos de Clientes
        $clientesSegmentos = \App\Models\Cliente::whereIn('clientes.co_cli', $coClients)
            ->join('segmento', 'clientes.co_seg', '=', 'segmento.co_seg')
            ->select('clientes.co_cli', 'segmento.seg_des')
            ->get()
            ->mapWithKeys(function ($item) {
                return [trim($item->co_cli) => $item->seg_des];
            });

        $facturas = $facturas->map(function ($factura) use ($documentos, $clientesSegmentos) {
                $doc = $documentos->get(trim($factura->nro_doc));
                
                $saldoActualLive = 0;
                if ($doc && $doc->tasa > 0) {
                    $saldoActualLive = $doc->saldo / $doc->tasa;
                } else if ($doc) {
                     $saldoActualLive = 0;
                } else {
                     $saldoActualLive = 0;
                }

                $calculation = round($saldoActualLive - $factura->saldo_inicial, 2);
                
                return [
                   'id' => $factura->id,
                   'nro_doc' => $factura->nro_doc,
                   'co_cli' => $factura->co_cli,
                   'nombre_cliente' => $factura->nombre_cliente,
                   'nombre_segmento' => $clientesSegmentos[trim($factura->co_cli)] ?? 'Sin Segmento',
                   'saldo_inicial' => $factura->saldo_inicial,
                   'saldo_actual' => $saldoActualLive,
                   // Monto Recuperado = Saldo Inicial - Saldo Actual (Live)
                   'monto_recuperado' => (float) $calculation == -0.0 ? 0 : $calculation,
                   'observacion' => $factura->observacion,
                   'estado' => $factura->estado,
                   'fecha_recuperacion' => $factura->updated_at->format('Y-m-d H:i:s')
                ];
            });

        return Inertia::render('Juridico/Recuperadas', [
            'facturas' => $facturas
        ]);
    }
}