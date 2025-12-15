<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Documento;
use App\Models\Cliente;
use App\Models\RenglonCobro;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class JuridicoController extends Controller
{
    public function index(Request $request) {
        // Listar Clientes Inactivos (En Jurídico) con sus saldos y morosidad
        $clientes = Cliente::where('inactivo', 1)
            ->select('co_cli as codigo', 'cli_des as descripcion', 'rif')
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

    public function show(Request $request, $clienteId) {
        // Verificar cliente
        $cliente = Cliente::where('co_cli', $clienteId)->firstOrFail();

        $facturas = Documento::query()
            ->select([
                // Campos simples (Laravel los maneja bien)
                'docum_cc.co_cli as codigo',
                'docum_cc.nro_doc as nro_factura',
                'docum_cc.fec_emis as emision',
                'docum_cc.fec_venc as vencimiento',
                'docum_cc.observa as observacion',
                
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
            'facturas' => $facturas
        ]);
    }
}