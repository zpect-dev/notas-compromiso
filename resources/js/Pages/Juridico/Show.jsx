import React from "react";
import TablaJuridico from "../../components/TablaJuridico";
import { Link } from "@inertiajs/react";
import { ArrowLeft, Building2 } from "lucide-react";

export default function Show({ facturas, cliente }) {
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* HEADER / NAV */}
                <div className="flex flex-col gap-4">
                    <Link 
                        href="/juridico" 
                        className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium text-sm group w-fit"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                        Volver al listado de clientes
                    </Link>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <Building2 className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                    {cliente.descripcion}
                                </h1>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                    <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200 font-mono text-xs text-gray-700">
                                        {cliente.codigo}
                                    </span>
                                    {cliente.rif && (
                                        <span>RIF: {cliente.rif}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* KPI O RESUMEN RÁPIDO SI SE DESEA */}
                        <div className="flex gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                             <div className="text-right">
                                <div className="text-xs text-gray-400 uppercase font-bold">Total Facturas</div>
                                <div className="text-2xl font-bold text-gray-900">{facturas.length}</div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* TABLA PRINCIPAL */}
                <TablaJuridico facturas={facturas} cliente={cliente} />
                
            </div>
        </div>
    );
}
