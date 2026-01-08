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
    LogOut,
    ChevronLeft,
    Handshake,
} from "lucide-react";
import { Link, usePage, router } from "@inertiajs/react";

export default function Index({ clientes, filters }) {
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
                route("juridico.index"),
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
                            Bienvenido,{" "}
                            <span className="font-semibold text-gray-700">
                                {user?.username}
                            </span>{" "}
                            {user?.is_admin ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 ml-2">
                                    ADMIN
                                </span>
                            ) : null}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {user?.is_admin && (
                            <div className="flex items-center gap-2">
                                <Link
                                    href={route("juridico.recuperadas")}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2"
                                >
                                    <Users className="w-4 h-4" />
                                    Recuperadas
                                </Link>
                                <Link
                                    href={route("juridico.enviados")}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                                >
                                    <Users className="w-4 h-4" />
                                    Ver Enviados
                                </Link>
                            </div>
                        )}
                        <Link
                            as="button"
                            method="post"
                            href={route("juridico.logout")}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Cerrar sesión"
                        >
                            <LogOut className="w-5 h-5" />
                        </Link>
                        <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200 shadow-sm flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {clientes.total} Clientes
                        </div>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="mb-8 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative group flex-1 max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-white shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:text-gray-900 placeholder-gray-400 text-sm transition-all"
                                placeholder="Buscar cliente por código, nombre o RIF..."
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
                                "CONVENIO",
                                "SANO",
                                "OPORTUNIDAD",
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
                                    {status
                                        .replace("_", " ")
                                        .replace("OPORTUNIDAD", "ALTO VALOR")}
                                </button>
                            ))}
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
                                                {cliente.convenio_pago && (
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 my-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm text-xs font-bold">
                                                        <Handshake className="w-3.5 h-3.5" />
                                                        <span>
                                                            {cliente.frecuencia_convenio ||
                                                                "Convenio"}
                                                        </span>
                                                        {cliente.cantidad_pagar && (
                                                            <>
                                                                <span className="text-indigo-300">
                                                                    •
                                                                </span>
                                                                <span className="font-mono">
                                                                    {formatCurrency(
                                                                        cliente.cantidad_pagar
                                                                    )}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                                {cliente.ultimo_cobro_general_fecha && (
                                                    <div className="flex items-center gap-1 text-xs text-green-600 font-medium mt-0.5">
                                                        <span>
                                                            Último cobro:{" "}
                                                            {new Date(
                                                                cliente.ultimo_cobro_general_fecha
                                                            ).toLocaleDateString(
                                                                "es-VE",
                                                                {
                                                                    timeZone:
                                                                        "UTC",
                                                                }
                                                            )}
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {formatCurrency(
                                                                cliente.ultimo_cobro_general_monto
                                                            )}
                                                        </span>
                                                    </div>
                                                )}

                                                {cliente.rif && (
                                                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                                        <span className="font-medium text-gray-400">
                                                            RIF:
                                                        </span>{" "}
                                                        {cliente.rif}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="ml-4 shrink-0 self-center">
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
                                                {user?.is_admin && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            if (
                                                                confirm(
                                                                    "¿Enviar cliente a Jurídico?"
                                                                )
                                                            ) {
                                                                router.post(
                                                                    route(
                                                                        "juridico.enviar"
                                                                    ),
                                                                    {
                                                                        co_cli: cliente.codigo,
                                                                        saldo: cliente.saldo_por_cobrar,
                                                                    },
                                                                    {
                                                                        preserveScroll: true,
                                                                        onSuccess:
                                                                            () =>
                                                                                alert(
                                                                                    "Cliente enviado correctamente"
                                                                                ),
                                                                    }
                                                                );
                                                            }
                                                        }}
                                                        className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors z-10"
                                                    >
                                                        Enviar
                                                    </button>
                                                )}
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
                                    // Strip html entities if any, usually just numbers
                                    label = link.label.replace(
                                        /&amp;laquo;|&amp;raquo;|&laquo;|&raquo;/g,
                                        ""
                                    );
                                }

                                const isPrevOrNext =
                                    link.label.includes("Previous") ||
                                    link.label.includes("Next");
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
