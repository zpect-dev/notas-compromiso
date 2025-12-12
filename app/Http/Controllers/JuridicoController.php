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
        // Listar Clientes Inactivos (En Jurídico)
        $clientes = Cliente::where('inactivo', 1)
            ->select('co_cli as codigo', 'cli_des as descripcion', 'rif')
            ->orderBy('cli_des', 'asc')
            ->get();

        return Inertia::render('Juridico/Index', [
            'clientes' => $clientes
        ]);
    }

    public function show(Request $request, $clienteId) {
        // Verificar cliente
        $cliente = Cliente::where('co_cli', $clienteId)->firstOrFail();

        // Obtener facturas del cliente con la misma lógica que tenías antes
        $facturas = Documento::query()
            ->select([
                // Campos directos de la tabla de documentos
                'docum_cc.co_cli as codigo',
                'docum_cc.nro_doc as nro_factura',
                'docum_cc.monto_net as monto_factura', 
                'docum_cc.fec_emis as emision',
                'docum_cc.fec_venc as vencimiento',
                'docum_cc.monto_net as saldo_inicial', 
                'docum_cc.saldo as saldo_actual',
                'docum_cc.observa as observacion',
                
                // Campos de la relación (Join)
                DB::raw("RTRIM(clientes.cli_des) as cliente"),

                // Cálculo de MOROSIDAD (Días vencidos)
                // Si saldo <= 0 (Recuperado), fecha cobro - fecha vencimiento. Si no, fecha actual - fecha vencimiento.
                DB::raw("
                    CASE 
                        WHEN docum_cc.saldo <= 0 THEN 
                            DATEDIFF(day, docum_cc.fec_venc, (
                                SELECT TOP 1 c.fec_cob 
                                FROM reng_cob rc 
                                JOIN cobros c ON rc.cob_num = c.cob_num 
                                WHERE rc.doc_num = docum_cc.nro_doc 
                                AND rc.tp_doc_cob = 'FACT' 
                                ORDER BY c.fec_cob DESC
                            ))
                        ELSE 
                            DATEDIFF(day, docum_cc.fec_venc, GETDATE()) 
                    END as dias_morosidad
                "),
                
                // Estado Recuperado (Logica visual de tu excel)
                DB::raw("CASE WHEN docum_cc.saldo <= 0 THEN 'RECUPERADO' ELSE 'PENDIENTE' END as estado_recuperacion"),

                // Subconsulta para fecha del último abono
                'ultimo_cobro_fecha' => RenglonCobro::select('cobros.fec_cob')
                    ->join('cobros', 'reng_cob.cob_num', '=', 'cobros.cob_num')
                    ->whereColumn('reng_cob.doc_num', 'docum_cc.nro_doc') 
                    ->where('reng_cob.tp_doc_cob', 'FACT')
                    ->latest('cobros.fec_cob')
                    ->limit(1),

                // Subconsulta para monto del último abono
                'ultimo_cobro_monto' => RenglonCobro::select('reng_cob.neto') 
                    ->join('cobros', 'reng_cob.cob_num', '=', 'cobros.cob_num')
                    ->whereColumn('reng_cob.doc_num', 'docum_cc.nro_doc')
                    ->where('reng_cob.tp_doc_cob', 'FACT')
                    ->latest('cobros.fec_cob')
                    ->limit(1)
            ])
            ->join('clientes', 'docum_cc.co_cli', '=', 'clientes.co_cli')
            ->where('docum_cc.tipo_doc', 'FACT') // Solo Facturas
            ->where('docum_cc.anulado', 0) // Que no estén anuladas
            ->where('docum_cc.co_cli', $clienteId) // FILTRO POR CLIENTE
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