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

class JuridicoController extends Controller
{
    public function index(Request $request) {
        // Listar Clientes Inactivos (En Jurídico) con sus saldos y morosidad
        $query = Cliente::where('inactivo', 0); // Assuming user wants active clients filtered or strictly from the list? 
        // User request: "el usuario normal vera en su dashboard solo los usuarios que esten en esa tabla"
        // And "consultar en profit solo los usuarios que estan en la tabla"
        // I should probably start with query builder.

        $user = $request->session()->get('juridico_user');
        
        if (!$user || !$user->is_admin) {
            // Si es usuario normal, filtrar por la tabla juridico_clientes
            $clientesJuridico = \App\Models\JuridicoCliente::pluck('co_cli');
            $query->whereIn('co_cli', $clientesJuridico);
        }

        $clientes = $query->select('co_cli as codigo', 'cli_des as descripcion', 'rif')
            ->addSelect([
                'saldo_por_cobrar' => Documento::selectRaw('SUM((saldo / tasa))')
                    ->whereColumn('docum_cc.co_cli', 'clientes.co_cli')
                    ->where('tipo_doc', 'FACT')
                    ->where('anulado', 0)
                    ->where('saldo', '>', 0),
                'morosidad_maxima' => Documento::selectRaw('MAX(DATEDIFF(day, fec_venc, GETDATE()))')
                    ->whereColumn('docum_cc.co_cli', 'clientes.co_cli')
                    ->where('tipo_doc', 'FACT')
                    ->where('anulado', 0)
                    ->where('saldo', '>', 0)
            ])
            ->orderBy('cli_des', 'asc')
            ->get();

        return Inertia::render('Juridico/Index', [
            'clientes' => $clientes
        ]);
    }

    public function enviar(Request $request) {
        $request->validate([
            'co_cli' => 'required|string',
            'saldo' => 'required|numeric'
        ]);

        \App\Models\JuridicoCliente::updateOrCreate(
            ['co_cli' => $request->co_cli],
            ['saldo' => $request->saldo]
        );

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

        $facturas = Documento::query()
            ->select([
                // Campos simples (Laravel los maneja bien)
                'docum_cc.co_cli as codigo',
                'docum_cc.nro_doc as nro_factura',
                'docum_cc.fec_emis as emision',
                'docum_cc.fec_venc as vencimiento',
                'docum_cc.observa as observacion',
                'segmento.seg_des as nombre_segmento',
                
                // --- CORRECCIÓN AQUÍ: Usar DB::raw para las divisiones ---
                DB::raw('(docum_cc.monto_net / docum_cc.tasa) as monto_factura'),
                DB::raw('(docum_cc.monto_net / docum_cc.tasa) as saldo_inicial'),
                DB::raw('(docum_cc.saldo / docum_cc.tasa) as saldo_actual'),
                
                // Campos de relación
                DB::raw("RTRIM(clientes.cli_des) as cliente"),

                // Morosidad (Ya lo tenías en DB::raw, está bien)
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
}