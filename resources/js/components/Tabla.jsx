import React, { useState } from "react";
import { Check, X, MessageSquare, AlertCircle } from "lucide-react";
import { router } from "@inertiajs/react";
import { toast } from "sonner"; // Asegúrate de importar tu librería de Toast
import ModalRechazo from "../components/modal/ModalRechazo";

export default function Tabla({ notas }) {
    // 1. ESTADO: Solo necesitamos controlar el Modal y qué nota se está editando
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notaParaRechazar, setNotaParaRechazar] = useState(null);

    // 2. LÓGICA: Aprobar (Cumplió = true)
    const handleApprove = (nota) => {
        router.post(
            `/nota/${nota.fact_num}`,
            {
                cumplio: 1, // 1 = True en MySQL
                comentario: null, // Limpiamos comentario si existía
            },
            {
                preserveScroll: true, // Mantiene la posición en la tabla
                onSuccess: () => {
                    toast.success(`Factura #${nota.fact_num} aprobada`);
                },
                onError: () => {
                    toast.error("Error al aprobar la nota");
                },
            }
        );
    };

    // 3. LÓGICA: Abrir Modal de Rechazo
    const handleRejectClick = (nota) => {
        setNotaParaRechazar(nota); // Guardamos el OBJETO nota completo, no el index
        setIsModalOpen(true);
    };

    // 4. LÓGICA: Confirmar Rechazo (Se pasa al Modal)
    const handleConfirmReject = (comentario) => {
        // Retornamos una Promesa para que el Modal muestre el "loading"
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
                        setIsModalOpen(false); // Cerramos el modal
                        setNotaParaRechazar(null);
                        resolve(); // Avisamos al modal que todo salió bien
                    },
                    onError: (errors) => {
                        toast.error("Error al guardar el rechazo");
                        console.error(errors);
                        reject(); // Avisamos al modal que hubo error
                    },
                }
            );
        });
    };

    // 5. ESTILOS DINÁMICOS DE FILA
    const getRowClass = (nota, index) => {
        const base = "transition-colors duration-200";
        const zebra = index % 2 === 0 ? "bg-white" : "bg-gray-50";

        // Nota: Usamos == para que coincida '1' con true o 1
        if (nota.cumplio == true)
            return "bg-green-50 border-l-4 border-green-500";
        if (nota.cumplio == false)
            // Específicamente false (rechazado)
            return "bg-red-50 border-l-4 border-red-500";

        // Si es null (pendiente)
        return `${zebra} border-l-4 border-transparent hover:bg-gray-100`;
    };

    // 6. RENDERIZADO DE VACÍO
    if (!notas || notas.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
                <div className="p-3 bg-gray-100 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                    No hay datos
                </h3>
                <p className="text-gray-500 mt-1">
                    No hay notas o facturas pendientes para mostrar.
                </p>
            </div>
        );
    }

    return (
        <>
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
                        {notas.map((nota, index) => (
                            <tr
                                key={nota.fact_num} // Usar ID único es mejor que index
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

                                {/* Columna Comentario */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm max-w-[150px]">
                                    {nota.cumplio == false &&
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

                                {/* Columna Acciones */}
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="flex items-center justify-center gap-3">
                                        {/* Botón APROBAR */}
                                        <button
                                            onClick={() => handleApprove(nota)}
                                            disabled={
                                                nota.cumplio !== null ||
                                                nota.fec_pagar ===
                                                    "Formato Inválido"
                                            } // Deshabilita si ya se decidió
                                            className={`p-2 rounded-lg transition-all shadow-sm ${
                                                nota.cumplio == true
                                                    ? "bg-green-600 text-white ring-2 ring-green-300 ring-offset-1"
                                                    : "bg-white border border-gray-200 text-green-600 hover:bg-green-50 hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            }`}
                                            title="Cumplió"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>

                                        {/* Botón RECHAZAR */}
                                        <button
                                            onClick={() =>
                                                handleRejectClick(nota)
                                            }
                                            disabled={
                                                nota.cumplio !== null ||
                                                nota.fec_pagar ===
                                                    "Formato Inválido"
                                            }
                                            className={`p-2 rounded-lg transition-all shadow-sm ${
                                                nota.cumplio == false
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
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Conectado */}
            <ModalRechazo
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmReject}
            />
        </>
    );
}
