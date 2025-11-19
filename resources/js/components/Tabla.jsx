import React, { useState } from "react";
import { Check, X, MessageSquare, AlertCircle, Search } from "lucide-react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import ModalRechazo from "../components/modal/ModalRechazo";

export default function Tabla({ notas }) {
    // 1. ESTADOS
    const [searchCodigo, setSearchCodigo] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notaParaRechazar, setNotaParaRechazar] = useState(null);

    // 2. LÓGICA DE FILTRADO (Cliente)
    // Filtramos las notas que vienen de props antes de renderizarlas
    const notasFiltradas =
        notas?.filter((nota) => {
            if (!searchCodigo) return true;
            const busqueda = searchCodigo.toLowerCase();
            const codigo = nota.co_cli?.toString().toLowerCase() || "";
            const cliente = nota.cli_des?.toLowerCase() || "";
            // Busca por código O por nombre de cliente
            return codigo.includes(busqueda) || cliente.includes(busqueda);
        }) || [];

    // 3. BACKEND: Aprobar
    const handleApprove = (nota) => {
        router.post(
            `/nota/${nota.fact_num}`, // Asegúrate que esta ruta exista en Laravel
            {
                cumplio: 1, // 1 = True
                comentario: null,
            },
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success(`Factura #${nota.fact_num} aprobada`),
                onError: () => toast.error("Error al aprobar la nota"),
            }
        );
    };

    // 4. BACKEND: Preparar Rechazo
    const handleRejectClick = (nota) => {
        setNotaParaRechazar(nota);
        setIsModalOpen(true);
    };

    // 5. BACKEND: Confirmar Rechazo (Desde el Modal)
    const handleConfirmReject = (comentario) => {
        return new Promise((resolve, reject) => {
            if (!notaParaRechazar) {
                reject();
                return;
            }

            router.post(
                `/nota/${notaParaRechazar.fact_num}`,
                {
                    cumplio: 0, // 0 = False
                    comentario: comentario,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success("Nota rechazada correctamente");
                        setIsModalOpen(false);
                        setNotaParaRechazar(null);
                        resolve(); // Cierra el loading del modal
                    },
                    onError: (errors) => {
                        toast.error("Error al guardar el rechazo");
                        console.error(errors);
                        reject(); // Mantiene el modal abierto
                    },
                }
            );
        });
    };

    // 6. ESTILOS DINÁMICOS
    const getRowClass = (nota, index) => {
        const base = "transition-colors duration-200";
        const zebra = index % 2 === 0 ? "bg-white" : "bg-gray-50";

        // Usamos == para comparar 1 con true o '1' sin problemas
        if (nota.cumplio == 1) return "bg-green-50 border-l-4 border-green-500";
        if (nota.cumplio == 0) return "bg-red-50 border-l-4 border-red-500";

        return `${zebra} border-l-4 border-transparent hover:bg-gray-100`;
    };

    // 7. RENDERIZADO VACÍO
    if (!notas || notas.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
                <div className="p-3 bg-gray-100 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                    No hay datos
                </h3>
                <p className="text-gray-500 mt-1">No hay notas pendientes.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* BARRA DE BÚSQUEDA */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="relative w-full max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                        placeholder="Buscar por código o nombre de cliente..."
                        value={searchCodigo}
                        onChange={(e) => setSearchCodigo(e.target.value)}
                    />
                </div>
                <div className="text-sm text-gray-500">
                    {notasFiltradas.length} resultados
                </div>
            </div>

            {/* TABLA */}
            <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Cód.
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Cliente
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Seg
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Vend
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Factura
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Fecha
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Debe
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Días
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Comentario
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {notasFiltradas.length > 0 ? (
                            notasFiltradas.map((nota, index) => (
                                <tr
                                    key={nota.fact_num}
                                    className={getRowClass(nota, index)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">
                                        {nota.co_cli}
                                    </td>
                                    <td
                                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[180px]"
                                        title={nota.cli_des}
                                    >
                                        {nota.cli_des}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                        {nota.co_seg}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                        {nota.co_ven}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-bold">
                                        #{nota.fact_num}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {nota.fec_pagar}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                                        {new Intl.NumberFormat("es-VE", {
                                            style: "currency",
                                            currency: "USD",
                                        }).format(nota.cant_pagar)}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm ${
                                                nota.dias_restantes <= 30
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-emerald-100 text-emerald-800"
                                            }`}
                                        >
                                            {nota.dias_restantes}d
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm max-w-[150px]">
                                        {nota.cumplio == 0 &&
                                        nota.comentario ? (
                                            <div
                                                className="flex items-center gap-2 text-red-600 italic truncate"
                                                title={nota.comentario}
                                            >
                                                <MessageSquare className="w-4 h-4 shrink-0" />
                                                <span className="truncate">
                                                    {nota.comentario}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-300 text-xs">
                                                -
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() =>
                                                    handleApprove(nota)
                                                }
                                                disabled={nota.cumplio !== null}
                                                className={`p-2 rounded-lg transition-all shadow-sm ${
                                                    nota.cumplio == 1
                                                        ? "bg-green-600 text-white ring-2 ring-green-300 ring-offset-1"
                                                        : "bg-white border border-gray-200 text-green-600 hover:bg-green-50 hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                }`}
                                                title="Aprobar"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleRejectClick(nota)
                                                }
                                                disabled={nota.cumplio !== null}
                                                className={`p-2 rounded-lg transition-all shadow-sm ${
                                                    nota.cumplio == 0
                                                        ? "bg-red-600 text-white ring-2 ring-red-300 ring-offset-1"
                                                        : "bg-white border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                }`}
                                                title="Rechazar"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="10"
                                    className="px-6 py-10 text-center text-gray-500"
                                >
                                    <p>
                                        No se encontraron coincidencias con "
                                        {searchCodigo}"
                                    </p>
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
