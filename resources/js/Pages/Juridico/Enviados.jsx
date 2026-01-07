import React, { useState } from "react";
import {
    Search,
    User,
    Filter,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    Hash,
    Phone,
    Users,
    LogOut,
    ArrowLeft,
} from "lucide-react";
import { Link, usePage, router } from "@inertiajs/react";

export default function Enviados({ clientes, filters }) {
    const { data: clientesData, links, meta } = clientes;
    const { auth } = usePage().props;
    const user = auth?.juridico_user;

    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [filterStatus, setFilterStatus] = useState(filters.status || "TODOS");

    const isFirstRender = React.useRef(true);

    // Debounce search
    React.useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            router.get(
                route("juridico.enviados"),
                {
                    search: searchTerm,
                    status: filterStatus,
                },
                {
                    preserveState: true,
                    replace: true,
                }
            );
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, filterStatus]);

    const getClientStatus = (saldo, diasMora) => {
        const saldoNum = parseFloat(saldo || 0);
        const diasNum = parseInt(diasMora || 0);

        if (saldoNum > 2000 && diasNum > 60) {
            return {
                key: "PERDIDA_TOTAL",
                label: "Pérdida Total",
                color: "bg-red-50 text-red-700 border-red-200",
                iconColor: "text-red-400",
                amountColor: "text-red-700",
            };
        } else if (diasNum > 60) {
            return {
                key: "CRITICO",
                label: "Crítico",
                color: "bg-orange-50 text-orange-700 border-orange-200",
                iconColor: "text-orange-400",
                amountColor: "text-orange-700",
            };
        } else if (diasNum >= 30 && diasNum <= 60) {
            return {
                key: "ADVERTENCIA",
                label: "Advertencia",
                color: "bg-yellow-50 text-yellow-700 border-yellow-200",
                iconColor: "text-yellow-400",
                amountColor: "text-yellow-700",
            };
        } else if (saldoNum > 2000 && diasNum < 30) {
            return {
                key: "OPORTUNIDAD",
                label: "Alto Valor",
                color: "bg-blue-50 text-blue-700 border-blue-200",
                iconColor: "text-blue-400",
                amountColor: "text-blue-700",
            };
        } else {
            return {
                key: "SANO",
                label: "Sano",
                color: "bg-green-50 text-green-700 border-green-200",
                iconColor: "text-green-400",
                amountColor: "text-green-700",
            };
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount || 0);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* TOP NAVIGATION BAR */}
            <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div>
                                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                                    Clientes Enviados
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link
                                href={route("juridico.index")}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Volver a Lista Principal
                            </Link>

                            {/* <div className="h-8 w-px bg-gray-200 mx-2"></div> */}

                            {/* <div className="flex items-center gap-3 pl-2">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {user?.nombre || "Usuario"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {user?.is_admin
                                            ? "Administrador"
                                            : "Cobranza"}
                                    </p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-100 to-violet-100 border-2 border-white shadow-md flex items-center justify-center">
                                    <span className="text-indigo-700 font-bold text-sm">
                                        {user?.nombre?.charAt(0) || "U"}
                                    </span>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </nav>

            {/* MAIN CONTENT AREA */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* METRICS & FILTERS */}
                <div className="mb-8 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative group flex-1 max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-white shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:text-gray-900 placeholder-gray-400 text-sm transition-all"
                                placeholder="Buscar por código, nombre o RIF..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            {/* <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1 shrink-0">
                                <Filter className="w-3 h-3 inline mr-1" />
                                Estado
                            </span> */}
                            {[
                                "TODOS",
                                "SANO",
                                "ALTO VALOR",
                                "ADVERTENCIA",
                                "CRITICO",
                                "PERDIDA_TOTAL",
                            ].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`
                                        px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0
                                        ${
                                            filterStatus === status
                                                ? "bg-slate-800 text-white border-slate-800 shadow-md shadow-slate-200"
                                                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                        }
                                    `}
                                >
                                    {status.replace("_", " ")}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            <span className="text-xs font-medium text-gray-500">
                                Clientes en Jurídico
                            </span>
                        </div>
                        <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200 shadow-sm flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {clientes.total} Clientes
                        </div>
                    </div>
                </div>

                {/* CLIENTES GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clientesData.length > 0 ? (
                        clientesData.map((cliente) => {
                            const status = getClientStatus(
                                cliente.saldo_por_cobrar,
                                cliente.morosidad_maxima
                            );

                            return (
                                <Link
                                    href={route(
                                        "juridico.show",
                                        cliente.codigo
                                    )}
                                    key={cliente.codigo}
                                    className="group relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
                                >
                                    <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500" />
                                    </div>

                                    <div className="flex flex-col h-full justify-between gap-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-start">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${status.color}`}
                                                >
                                                    {status.label}
                                                </span>
                                            </div>

                                            <div>
                                                <h3 className="text-base font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                    {cliente.descripcion}
                                                </h3>
                                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Hash className="w-3 h-3" />
                                                        {cliente.codigo}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <p>RIF:</p>
                                                        {cliente.rif || "N/A"}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 pt-2">
                                                <div
                                                    className={`h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden`}
                                                >
                                                    <div
                                                        className={`h-full rounded-full ${status.iconColor.replace(
                                                            "text-",
                                                            "bg-"
                                                        )}`}
                                                        style={{
                                                            width: "70%",
                                                        }}
                                                    ></div>
                                                </div>
                                                <ChevronRight
                                                    className={`w-5 h-5 group-hover:translate-x-1 transition-all ${status.iconColor}`}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-end justify-between">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                                                    <User className="w-3 h-3" />
                                                    Ver expediente
                                                </div>
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
                                No se encontraron clientes enviados
                            </h3>
                            <p className="text-gray-500 mt-1 max-w-sm">
                                Los clientes que envíes a jurídico aparecerán
                                aquí.
                            </p>
                        </div>
                    )}
                </div>

                {/* PAGINATION */}
                {links && links.length > 3 && (
                    <div className="flex items-center justify-center mt-10 pb-12">
                        <div className="flex flex-wrap gap-2 p-1 bg-white rounded-lg shadow-sm border border-gray-100">
                            {links.map((link, key) => {
                                let label = link.label;
                                if (link.label.includes("Previous")) {
                                    label = <ChevronLeft className="w-4 h-4" />;
                                } else if (link.label.includes("Next")) {
                                    label = (
                                        <ChevronRight className="w-4 h-4" />
                                    );
                                } else {
                                    label = link.label.replace(
                                        /&amp;laquo;|&amp;raquo;|&laquo;|&raquo;/g,
                                        ""
                                    );
                                }

                                const baseClasses =
                                    "flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200";

                                if (link.url === null) {
                                    return (
                                        <div
                                            key={key}
                                            className={`${baseClasses} text-gray-300 cursor-not-allowed`}
                                        >
                                            {label}
                                        </div>
                                    );
                                }

                                return (
                                    <Link
                                        key={key}
                                        className={`${baseClasses} ${
                                            link.active
                                                ? "bg-blue-600 text-white shadow-md transform scale-105"
                                                : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                        }`}
                                        href={link.url}
                                    >
                                        {label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
