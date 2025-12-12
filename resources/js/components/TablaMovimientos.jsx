import React, { useState } from "react";
import { Check, X, MessageSquare, Search, Wallet, Filter } from "lucide-react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import ModalRechazo from "../components/modal/ModalRechazo";

export default function TablaMovimientos({ movimientos }) {
    // 1. ESTADOS
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("todos");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [movimientoParaRechazar, setMovimientoParaRechazar] = useState(null);

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // 2. LÓGICA DE FILTRADO
    const movimientosFiltrados =
        movimientos?.filter((mov) => {
            const busqueda = searchTerm.toLowerCase();
            const nroMov = mov.mov_num?.toString().toLowerCase() || "";
            const caja = mov.caja?.descrip?.toLowerCase() || "";

            const matchesSearch =
                !searchTerm ||
                nroMov.includes(busqueda) ||
                caja.includes(busqueda);

            let matchesStatus = true;
            if (filterStatus === "pendientes") {
                matchesStatus = mov.movimiento === null;
            } else if (filterStatus === "aprobados") {
                matchesStatus = mov.movimiento !== null;
            }

            return matchesSearch && matchesStatus;
        }) || [];

    // 3. BACKEND: Aprobar
    const handleApprove = (mov) => {
        router.post(
            `/movimiento/${mov.mov_num}`,
            { aprobado: 1, observacion: null },
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success(`Movimiento #${mov.mov_num} aprobado`),
                onError: () => toast.error("Error al aprobar"),
            }
        );
    };

    // 4. BACKEND: Rechazar
    const handleRejectClick = (mov) => {
        setMovimientoParaRechazar(mov);
        setIsModalOpen(true);
    };

    const handleConfirmReject = (comentario) => {
        return new Promise((resolve, reject) => {
            if (!movimientoParaRechazar) {
                reject();
                return;
            }
            router.post(
                `/movimiento/${movimientoParaRechazar.mov_num}`,
                { cumplio: 0, comentario: comentario },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success("Movimiento rechazado correctamente");
                        setIsModalOpen(false);
                        setMovimientoParaRechazar(null);
                        resolve();
                    },
                    onError: () => {
                        toast.error("Error al procesar el rechazo");
                        reject();
                    },
                }
            );
        });
    };

    // 5. FORMATO DE MONEDA ESTÁNDAR (Sin forzar signo)
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined || amount === "")
            return "-";
        return new Intl.NumberFormat("es-VE", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    // 5b. NUEVO: FORMATO PARA DIFERENCIA (Fuerza el signo + o -)
    const formatCurrencyDiff = (amount) => {
        if (amount === null || amount === undefined || isNaN(amount))
            return "-";
        return new Intl.NumberFormat("es-VE", {
            style: "currency",
            currency: "USD",
            signDisplay: "always", // <--- Muestra + o - siempre
        }).format(amount);
    };

    // 6. LÓGICA DE COLORES DE FILA (ACTUALIZADA)
    const getRowClass = (mov, index) => {
        const zebra = index % 2 === 0 ? "bg-white" : "bg-gray-50";
        const defaultStyle = `${zebra} border-l-4 border-transparent hover:bg-gray-100`;

        // Si no hay pagos registrados, estilo por defecto
        if (
            mov.abonos_sum_monto_h === null ||
            mov.abonos_sum_monto_h === undefined
        ) {
            return defaultStyle;
        }

        const montoDeuda = parseFloat(mov.monto_d || 0);
        const montoPagado = parseFloat(mov.abonos_sum_monto_h || 0);

        // Calculamos: Pagado - Deuda
        const diferencia = montoPagado - montoDeuda;

        // Si diferencia es >= 0 (o casi 0 por decimales), es VERDE (Saldo a favor o pago exacto)
        if (diferencia >= -0.01) {
            return "bg-green-50 border-l-4 border-green-500 hover:bg-green-100";
        } else {
            // Si es negativo (Deuda), es ROJO
            return "bg-red-50 border-l-4 border-red-500 hover:bg-red-100";
        }
    };

    if (!movimientos || movimientos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
                <div className="p-3 bg-gray-100 rounded-full mb-4">
                    <Wallet className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                    Sin Movimientos
                </h3>
                <p className="text-gray-500 mt-1">No hay datos para mostrar.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* --- BARRA DE CONTROL --- */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="relative w-full md:max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Buscar por Nro o caja..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="flex p-1 bg-gray-100 rounded-lg w-full md:w-auto">
                        {["todos", "pendientes", "aprobados"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${
                                    filterStatus === status
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="hidden md:block text-sm text-gray-500 whitespace-nowrap">
                    {movimientosFiltrados.length} resultados
                </div>
            </div>

            {/* --- TABLA --- */}
            <div className="overflow-x-auto overflow-y-auto max-h-[75vh] shadow-lg rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                            {[
                                "Mov. Nro",
                                "Caja",
                                "Tipo",
                                "Egreso",
                                "Ingreso",
                                "Diferencia",
                                "Descripción",
                                "Estado",
                                "Aprobado por",
                                // "Obs",
                                "Fecha",
                                "Acciones",
                            ].map((header) => (
                                <th
                                    key={header}
                                    className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {movimientosFiltrados.length > 0 ? (
                            movimientosFiltrados.map((mov, index) => (
                                <tr
                                    key={mov.mov_num}
                                    className={getRowClass(mov, index)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-gray-700">
                                        #{mov.mov_num}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        <span className="font-medium">
                                            {mov.caja?.descrip?.trim() ||
                                                "Sin Caja"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200">
                                            {mov.tipo_op}
                                        </span>
                                    </td>

                                    {/* COLUMNA: EGRESO / DEUDA */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                        <div className="text-gray-800">
                                            {formatCurrency(mov.monto_d)}
                                        </div>
                                    </td>

                                    {/* COLUMNA: INGRESO / PAGADO */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                        <div className="text-gray-600">
                                            {formatCurrency(
                                                mov.abonos_sum_monto_h
                                            )}
                                        </div>
                                    </td>

                                    {/* COLUMNA: DIFERENCIA (MODIFICADA) */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                        {(() => {
                                            const pagado = parseFloat(
                                                mov.abonos_sum_monto_h || 0
                                            );
                                            const deuda = parseFloat(
                                                mov.monto_d || 0
                                            );
                                            const diff = pagado - deuda;

                                            // Verde si es positivo/cero, Rojo si es negativo
                                            const colorClass =
                                                diff >= -0.01
                                                    ? "text-green-600"
                                                    : "text-red-600";

                                            return (
                                                <div className={colorClass}>
                                                    {mov.abonos_sum_monto_h ===
                                                    null
                                                        ? "-"
                                                        : formatCurrencyDiff(
                                                              diff
                                                          )}
                                                </div>
                                            );
                                        })()}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <div
                                            className="max-w-[200px] truncate"
                                            title={mov.descrip}
                                        >
                                            {mov.descrip || "-"}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm max-w-[150px]">
                                        {mov.cumplio == 0 && mov.comentario ? (
                                            <div
                                                className="flex items-center gap-2 text-red-800 font-medium italic truncate"
                                                title={mov.comentario}
                                            >
                                                <MessageSquare className="w-4 h-4 shrink-0" />
                                                <span className="truncate">
                                                    {mov.comentario}
                                                </span>
                                            </div>
                                        ) : mov.movimiento != null ? (
                                            <span className="text-green-800 bg-green-100 px-2 py-1 rounded text-xs font-bold border border-green-200">
                                                APROBADO
                                            </span>
                                        ) : (
                                            <span className="text-yellow-800 bg-yellow-100 px-2 py-1 rounded text-xs font-bold border border-yellow-200">
                                                PENDIENTE
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {mov.movimiento?.usuario.usuario || "-"}
                                    </td>
                                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <div
                                            className="max-w-[200px] truncate"
                                            title={mov.movimiento?.observacion}
                                        >
                                            {mov.movimiento?.observacion || "-"}
                                        </div>
                                    </td> */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {formatDate(
                                            mov.movimiento?.created_at
                                        ) || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() =>
                                                    handleApprove(mov)
                                                }
                                                disabled={
                                                    mov.movimiento !== null
                                                }
                                                className={`p-2 rounded-lg transition-all shadow-sm ${
                                                    mov.movimiento?.aprobado ==
                                                    1
                                                        ? "bg-green-600 text-white ring-2 ring-green-300"
                                                        : "bg-white border border-gray-200 text-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                }`}
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="12"
                                    className="px-6 py-10 text-center text-gray-500"
                                >
                                    <div className="flex flex-col items-center">
                                        <Filter className="w-8 h-8 text-gray-300 mb-2" />
                                        <p>
                                            No se encontraron movimientos con
                                            los filtros actuales.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ModalRechazo
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmReject}
            />
        </div>
    );
}
