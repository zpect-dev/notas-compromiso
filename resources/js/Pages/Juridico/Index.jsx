import React, { useState } from "react";
import { Search, User, Filter, AlertCircle, ChevronRight, Hash, Phone, Users } from "lucide-react";
import { Link } from "@inertiajs/react";

export default function Index({ clientes }) {
    const [searchTerm, setSearchTerm] = useState("");

    const clientesFiltrados = clientes.filter(cliente => {
        const busqueda = searchTerm.toLowerCase();
        const codigo = cliente.codigo.toLowerCase();
        const descripcion = cliente.descripcion.toLowerCase();
        const rif = (cliente.rif || "").toLowerCase();

        return codigo.includes(busqueda) || descripcion.includes(busqueda) || rif.includes(busqueda);
    });

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* HEADERS */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Gestión Jurídica</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Seleccione un cliente para ver su detalle de facturas y deudas.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200 shadow-sm flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {clientes.length} Clientes
                        </div>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm"
                            placeholder="Buscar cliente por código, nombre o RIF..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* CLIENTES GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clientesFiltrados.length > 0 ? (
                        clientesFiltrados.map((cliente) => (
                            <Link 
                                href={`/juridico/${cliente.codigo}`} 
                                key={cliente.codigo}
                                className="group block bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300 overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs ring-2 ring-white">
                                                    <Hash className="w-4 h-4" />
                                                </span>
                                                <span className="text-xs font-mono font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                                    {cliente.codigo}
                                                </span>
                                            </div>
                                            
                                            <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                                {cliente.descripcion}
                                            </h3>
                                            
                                            {cliente.rif && (
                                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                                    <span className="font-medium text-gray-400">RIF:</span> {cliente.rif}
                                                </p>
                                            )}
                                        </div>
                                        <div className="ml-4 flex-shrink-0 self-center">
                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                         <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                                            <User className="w-3 h-3" />
                                            Ver expediente
                                         </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-gray-200 border-dashed">
                            <Users className="w-12 h-12 text-gray-300 mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">No se encontraron clientes</h3>
                            <p className="text-gray-500 mt-1 max-w-sm">
                                Intenta buscar con otro término o verifica que el cliente esté en la lista.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
