import React, { useState, useEffect } from "react";
import { Check, X, MessageSquare, AlertCircle } from "lucide-react";
import ModalRechazo from "../components/modal/ModalRechazo"; // Ajusta la ruta donde guardaste el Modal

export default function Tabla({ notas }) {
    // 1. ESTADO LOCAL: Inicializamos lazy para evitar flash de datos vacíos
    const [localNotas, setLocalNotas] = useState(() => {
        if (!notas) return [];
        return notas.map((n) => ({ ...n, cumplio: null, comentario: null }));
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNotaIndex, setSelectedNotaIndex] = useState(null);

    // 2. SINCRONIZACIÓN: Si las props cambian (ej. filtro externo), actualizamos
    useEffect(() => {
        if (notas) {
            setLocalNotas(
                notas.map((n) => ({
                    ...n,
                    cumplio: n.cumplio ?? null, // Preserva estado si viene del backend
                    comentario: n.comentario || null,
                }))
            );
        }
    }, [notas]);

    // 3. LÓGICA DE NEGOCIO
    const handleUpdateBackend = (notaActualizada) => {
        console.log("Enviando al backend:", notaActualizada);
    };

    const handleApprove = (index) => {
        const newNotas = [...localNotas];
        const updatedNota = {
            ...newNotas[index],
            cumplio: true,
            comentario: null,
        };
        newNotas[index] = updatedNota;
        setLocalNotas(newNotas);
        handleUpdateBackend(updatedNota);
    };

    const handleRejectClick = (index) => {
        setSelectedNotaIndex(index);
        setIsModalOpen(true);
    };

    const handleConfirmReject = (comment) => {
        if (selectedNotaIndex !== null) {
            const newNotas = [...localNotas];
            const updatedNota = {
                ...newNotas[selectedNotaIndex],
                cumplio: false,
                comentario: comment,
            };
            newNotas[selectedNotaIndex] = updatedNota;
            setLocalNotas(newNotas);
            handleUpdateBackend(updatedNota);
            // El modal se cierra solo
        }
    };

    // 4. ESTILOS DINÁMICOS DE FILA
    const getRowClass = (nota, index) => {
        const base = "transition-colors duration-200";
        const zebra = index % 2 === 0 ? "bg-white" : "bg-gray-50";

        if (nota.cumplio == true)
            return "bg-green-50 border-l-4 border-green-500";
        if (nota.cumplio == false) return "bg-red-50 border-l-4 border-red-500";

        return `${zebra} border-l-4 border-transparent hover:bg-gray-100`;
    };

    // 5. RENDERIZADO DE CARGA O VACÍO
    if (!localNotas || localNotas.length === 0) {
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
                            {/* Headers Originales */}
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

                            {/* Headers Nuevos */}
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Comentario
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {localNotas.map((nota, index) => (
                            <tr
                                key={index}
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
                                        <button
                                            onClick={() => handleApprove(index)}
                                            disabled={nota.cumplio !== null}
                                            className={`p-2 rounded-lg transition-all shadow-sm ${
                                                nota.cumplio == true
                                                    ? "bg-green-600 text-white ring-2 ring-green-300 ring-offset-1"
                                                    : "bg-white border border-gray-200 text-green-600 hover:bg-green-50 hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            }`}
                                            title="Cumplió"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleRejectClick(index)
                                            }
                                            disabled={nota.cumplio !== null}
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

            {/* Modal Renderizado fuera de la tabla */}
            <ModalRechazo
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmReject}
            />
        </>
    );
}
