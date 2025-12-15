import React, { useState } from "react";
import {
    Search,
    User,
    Filter,
    AlertCircle,
    ChevronRight,
    Hash,
    Phone,
    Users,
} from "lucide-react";
import { Link } from "@inertiajs/react";

export default function Index({ clientes }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("TODOS");

    const getClientStatus = (saldo, diasMora) => {
        const saldoNum = parseFloat(saldo || 0);
        const diasNum = parseInt(diasMora || 0);

        // 1. Pérdida Total (Violeta/Negro)
        // > $2000 y > 60 días
        if (saldoNum > 2000 && diasNum > 60) {
            return {
                key: "PERDIDA_TOTAL",
                label: "Pérdida Total",
                color: "bg-purple-50 text-purple-700 border-purple-200",
                badge: "bg-purple-100 text-purple-800",
                iconColor: "text-purple-500",
                borderColor: "border-purple-300 shadow-purple-100",
                amountColor: "text-purple-700",
            };
        }

        // 2. Crítico (Rojo)
        // > 60 días (cualquier monto, si no cayó en pérdida total)
        if (diasNum > 60) {
            return {
                key: "CRITICO",
                label: "Crítico",
                color: "bg-red-50 text-red-700 border-red-200",
                badge: "bg-red-100 text-red-800",
                iconColor: "text-red-500",
                borderColor: "border-red-300 shadow-red-100",
                amountColor: "text-red-700",
            };
        }

        // 3. Advertencia (Amarillo/Naranja)
        // Montos bajos/medios con mora media (30-60 días)
        if (diasNum >= 30 && diasNum <= 60) {
            return {
                key: "ADVERTENCIA",
                label: "Advertencia",
                color: "bg-orange-50 text-orange-700 border-orange-200",
                badge: "bg-orange-100 text-orange-800",
                iconColor: "text-orange-500",
                borderColor: "border-orange-300 shadow-orange-100",
                amountColor: "text-orange-700",
            };
        }

        // 4. Sano (Verde/Azul)
        // Por defecto o recien (< 30 días)
        // Si deben mucho (>2000) pero reciente -> Azul
        if (saldoNum > 2000) {
            return {
                key: "OPORTUNIDAD",
                label: "Oportunidad",
                color: "bg-blue-50 text-blue-700 border-blue-200",
                badge: "bg-blue-100 text-blue-800",
                iconColor: "text-blue-500",
                borderColor: "border-blue-300 shadow-blue-100",
                amountColor: "text-blue-700",
            };
        }

        // Deuda pequeña y reciente -> Verde
        return {
            key: "SANO",
            label: "Sano",
            color: "bg-green-50 text-green-700 border-green-200",
            badge: "bg-green-100 text-green-800",
            iconColor: "text-green-500",
            borderColor: "border-green-300 shadow-green-100",
            amountColor: "text-green-700",
        };
    };

    const clientesFiltrados = clientes.filter((cliente) => {
        const busqueda = searchTerm.toLowerCase();
        const codigo = cliente.codigo.toLowerCase();
        const descripcion = cliente.descripcion.toLowerCase();
        const rif = (cliente.rif || "").toLowerCase();

        const matchesSearch =
            codigo.includes(busqueda) ||
            descripcion.includes(busqueda) ||
            rif.includes(busqueda);

        if (!matchesSearch) return false;

        if (filterStatus === "TODOS") return true;

        const status = getClientStatus(
            cliente.saldo_por_cobrar,
            cliente.morosidad_maxima
        );
        return status.key === filterStatus;
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount || 0);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* HEADERS */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Gestión Jurídica
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Seleccione un cliente para ver su detalle de
                            facturas y deudas.
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
                <div className="space-y-4">
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

                    <div className="flex flex-wrap gap-2">
                        {[
                            {
                                key: "TODOS",
                                label: "Todos",
                                color: "bg-gray-100 text-gray-700 hover:bg-gray-200",
                            },
                            {
                                key: "SANO",
                                label: "Sano",
                                color: "bg-green-100 text-green-800 hover:bg-green-200",
                            },
                            {
                                key: "OPORTUNIDAD",
                                label: "Alto valor",
                                color: "bg-blue-100 text-blue-800 hover:bg-blue-200",
                            },
                            {
                                key: "ADVERTENCIA",
                                label: "Advertencia",
                                color: "bg-orange-100 text-orange-800 hover:bg-orange-200",
                            },
                            {
                                key: "CRITICO",
                                label: "Crítico",
                                color: "bg-red-100 text-red-800 hover:bg-red-200",
                            },
                            {
                                key: "PERDIDA_TOTAL",
                                label: "Alto riesgo",
                                color: "bg-purple-100 text-purple-800 hover:bg-purple-200",
                            },
                        ].map((filter) => (
                            <button
                                key={filter.key}
                                onClick={() => setFilterStatus(filter.key)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                    filterStatus === filter.key
                                        ? "ring-2 ring-offset-2 ring-gray-400 shadow-md transform scale-105 " +
                                          filter.color
                                        : "opacity-70 hover:opacity-100 " +
                                          filter.color
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CLIENTES GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clientesFiltrados.length > 0 ? (
                        clientesFiltrados.map((cliente) => {
                            const status = getClientStatus(
                                cliente.saldo_por_cobrar,
                                cliente.morosidad_maxima
                            );

                            return (
                                <Link
                                    href={`/juridico/${cliente.codigo}`}
                                    key={cliente.codigo}
                                    className={`group block bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${status.borderColor}`}
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span
                                                        className={`inline-flex items-center justify-center h-8 w-8 rounded-full font-bold text-xs ring-2 ring-white ${status.badge}`}
                                                    >
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
                                                        <span className="font-medium text-gray-400">
                                                            RIF:
                                                        </span>{" "}
                                                        {cliente.rif}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="ml-4 flex-shrink-0 self-center">
                                                <ChevronRight
                                                    className={`w-5 h-5 group-hover:translate-x-1 transition-all ${status.iconColor}`}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-end justify-between">
                                            <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                                                <User className="w-3 h-3" />
                                                Ver expediente
                                            </div>

                                            <div className="text-right">
                                                <p
                                                    className={`text-sm font-bold ${status.amountColor}`}
                                                >
                                                    {formatCurrency(
                                                        cliente.saldo_por_cobrar
                                                    )}
                                                </p>
                                                <p className="text-xs font-medium text-gray-500">
                                                    {cliente.morosidad_maxima >
                                                    0
                                                        ? `${cliente.morosidad_maxima} días mora`
                                                        : "Al día"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-gray-200 border-dashed">
                            <Users className="w-12 h-12 text-gray-300 mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">
                                No se encontraron clientes
                            </h3>
                            <p className="text-gray-500 mt-1 max-w-sm">
                                Intenta buscar con otro término o verifica que
                                el cliente esté en la lista.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
