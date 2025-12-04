import React, { useState } from "react";
import { Check, X, MessageSquare, Search, Wallet, Filter } from "lucide-react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import ModalRechazo from "../components/modal/ModalRechazo";

export default function TablaMovimientos({ movimientos }) {
    // 1. ESTADOS
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("todos"); // 'todos', 'pendientes', 'aprobados'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [movimientoParaRechazar, setMovimientoParaRechazar] = useState(null);

    // Helper para formatear fecha a d-m-Y
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // 2. LÓGICA DE FILTRADO COMBINADA (Búsqueda + Estado)
    const movimientosFiltrados =
        movimientos?.filter((mov) => {
            // A. Filtro de Texto
            const busqueda = searchTerm.toLowerCase();
            const nroMov = mov.mov_num?.toString().toLowerCase() || "";
            const caja = mov.caja?.descrip?.toLowerCase() || "";
            const descripcion = mov.descrip?.toLowerCase() || "";
            const adicional = mov.campo4?.toLowerCase() || "";

            const matchesSearch =
                !searchTerm ||
                nroMov.includes(busqueda) ||
                caja.includes(busqueda);

            // B. Filtro de Estado (Botones)
            let matchesStatus = true;
            if (filterStatus === "pendientes") {
                // Pendiente es cuando NO tiene movimiento asociado
                matchesStatus = mov.movimiento === null;
            } else if (filterStatus === "aprobados") {
                // Aprobado es cuando SI tiene movimiento asociado
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

    // 4. BACKEND: Preparar Rechazo
    const handleRejectClick = (mov) => {
        setMovimientoParaRechazar(mov);
        setIsModalOpen(true);
    };

    // 5. BACKEND: Confirmar Rechazo
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
                    onError: (errors) => {
                        toast.error("Error al procesar el rechazo");
                        reject();
                    },
                }
            );
        });
    };

    // 6. LÓGICA DE COLORES
    const getRowClass = (mov, index) => {
        const zebra = index % 2 === 0 ? "bg-white" : "bg-gray-50";
        const defaultStyle = `${zebra} border-l-4 border-transparent hover:bg-gray-100`;

        if (
            mov.campo4 === null ||
            mov.campo4 === undefined ||
            String(mov.campo4).trim() === ""
        ) {
            return defaultStyle;
        }

        const montoD = parseFloat(mov.monto_d || 0);
        const campo4 = parseFloat(mov.campo4 || 0);

        if (Math.abs(montoD - campo4) < 0.01) {
            return "bg-green-50 border-l-4 border-green-500";
        } else {
            return "bg-red-50 border-l-4 border-red-500";
        }
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined || amount === "")
            return "-";
        return new Intl.NumberFormat("es-VE", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    // 7. RENDERIZADO VACÍO (Solo si no hay datos iniciales)
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
            {/* --- BARRA DE CONTROL (BUSQUEDA + FILTROS) --- */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                {/* A. Input de Búsqueda */}
                <div className="relative w-full md:max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                        placeholder="Buscar por Nro de movimiento o nombre de caja"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* B. Botones de Filtro (Pendientes / Aprobados) */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="flex p-1 bg-gray-100 rounded-lg w-full md:w-auto">
                        <button
                            onClick={() => setFilterStatus("todos")}
                            className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                                filterStatus === "todos"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setFilterStatus("pendientes")}
                            className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                                filterStatus === "pendientes"
                                    ? "bg-white text-yellow-700 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Pendientes
                        </button>
                        <button
                            onClick={() => setFilterStatus("aprobados")}
                            className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                                filterStatus === "aprobados"
                                    ? "bg-white text-green-700 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Aprobados
                        </button>
                    </div>
                </div>

                {/* C. Contador */}
                <div className="hidden md:block text-sm text-gray-500 whitespace-nowrap">
                    {movimientosFiltrados.length} resultados
                </div>
            </div>

            {/* --- TABLA --- */}
            {/* CAMBIOS AQUÍ:
               1. max-h-[75vh]: Define una altura máxima (aprox 75% de la pantalla).
               2. overflow-y-auto: Habilita scroll vertical si el contenido excede la altura.
            */}
            <div className="overflow-x-auto overflow-y-auto max-h-[75vh] shadow-lg rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    {/* CAMBIOS AQUÍ:
                       1. sticky top-0: Mantiene el encabezado fijo arriba.
                       2. z-10: Asegura que el encabezado esté por encima del contenido al hacer scroll.
                    */}
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Mov. Nro
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Caja
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Tipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Egreso
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Ingreso
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Diferencia
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Descripción
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Aprobado por
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Observacion
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Fecha de aprobacion
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                        <div className="text-gray-800">
                                            {formatCurrency(mov.monto_d)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                        <div className="text-gray-600">
                                            {formatCurrency(mov.campo4)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                        <div className="text-gray-600">
                                            {mov.campo4 === null ||
                                            mov.campo4 === undefined ||
                                            String(mov.campo4).trim() === ""
                                                ? "-"
                                                : formatCurrency(
                                                      mov.monto_d - mov.campo4
                                                  )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <div
                                            className="max-w-[200px] truncate"
                                            title={mov.descrip}
                                        >
                                            {mov.descrip || "-"}
                                        </div>
                                    </td>

                                    {/* ESTADO */}
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
                                        <div
                                            className="max-w-[200px] truncate"
                                            title={mov.movimiento?.user_id}
                                        >
                                            {mov.movimiento?.user_id || "-"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <div
                                            className="max-w-[200px] truncate"
                                            title={mov.movimiento?.observacion}
                                        >
                                            {mov.movimiento?.observacion || "-"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <div
                                            className="max-w-[200px] truncate"
                                            title={mov.movimiento?.created_at}
                                        >
                                            {/* Usamos created_at para la fecha de aprobación, o mov.fecha para la fecha de caja */}
                                            {formatDate(
                                                mov.movimiento?.created_at
                                            ) || "-"}
                                        </div>
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
                                                        ? "bg-green-600 text-white ring-2 ring-green-300 ring-offset-1"
                                                        : "bg-white border border-gray-200 text-green-600 hover:bg-green-50 hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                }`}
                                                title="Aprobar"
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
