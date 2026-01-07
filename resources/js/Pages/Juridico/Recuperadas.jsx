import React, { useState } from "react";
import {
    Search,
    FileText,
    ArrowLeft,
    Download,
    DollarSign,
} from "lucide-react";
import { Link, router } from "@inertiajs/react";
import { toast } from "sonner";

export default function Recuperadas({ facturas }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [activeTab, setActiveTab] = useState("recuperadas"); // recuperadas | pagadas

    const facturasFiltradas = facturas.filter((fact) => {
        // Filter by tab
        if (activeTab === "recuperadas" && fact.estado !== 1) return false;
        if (activeTab === "pagadas" && fact.estado !== 2) return false;

        const busqueda = searchTerm.toLowerCase();
        return (
            fact.nro_doc.toLowerCase().includes(busqueda) ||
            (fact.nombre_cliente || "").toLowerCase().includes(busqueda) ||
            (fact.co_cli || "").toLowerCase().includes(busqueda) ||
            (fact.observacion || "").toLowerCase().includes(busqueda)
        );
    });

    const toggleSelectAll = () => {
        if (selectedIds.length === facturasFiltradas.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(facturasFiltradas.map((f) => f.id));
        }
    };

    const toggleSelectRow = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((sid) => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handlePagar = () => {
        if (selectedIds.length === 0) return;

        if (
            confirm(
                `¿Desea marcar como PAGADAS las ${selectedIds.length} facturas seleccionadas?`
            )
        ) {
            router.post(
                route("juridico.pagar"),
                { ids: selectedIds },
                {
                    onSuccess: () => {
                        toast.success(
                            "Facturas marcadas como pagadas correctamente"
                        );
                        setSelectedIds([]);
                    },
                }
            );
        }
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined || amount === "")
            return "-";

        // Handle negative zero
        if (Math.abs(amount) < 0.005) amount = 0;

        return new Intl.NumberFormat("es-VE", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-VE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const totalRecuperado = facturasFiltradas.reduce(
        (acc, curr) => acc + parseFloat(curr.monto_recuperado || 0),
        0
    );

    return (
        <div className="bg-gray-100 min-h-screen font-sans text-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-200 gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route("juridico.index")}
                            className="p-2 mr-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm border border-gray-200 transition-all hover:scale-105"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                Facturas Recuperadas
                            </h1>
                            <p className="text-sm text-gray-500 mt-1 font-medium">
                                Histórico de facturas gestionadas y recuperadas
                            </p>
                        </div>
                    </div>

                    <div className="flex bg-white px-5 py-3 rounded-xl shadow-sm border border-green-100 items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg text-green-700">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                                {activeTab === "recuperadas"
                                    ? "Total Recuperado"
                                    : "Total Pagado"}
                            </p>
                            <p className="text-xl font-bold text-green-600 font-mono">
                                {formatCurrency(totalRecuperado)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex space-x-1 rounded-xl bg-gray-200 p-1 mb-6 max-w-md">
                    <button
                        onClick={() => {
                            setActiveTab("recuperadas");
                            setSelectedIds([]);
                        }}
                        className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                            ${
                                activeTab === "recuperadas"
                                    ? "bg-white text-blue-700 shadow"
                                    : "text-gray-600 hover:bg-white/12 hover:text-gray-800"
                            }`}
                    >
                        Recuperadas
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("pagadas");
                            setSelectedIds([]);
                        }}
                        className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                            ${
                                activeTab === "pagadas"
                                    ? "bg-white text-purple-700 shadow"
                                    : "text-gray-600 hover:bg-white/12 hover:text-gray-800"
                            }`}
                    >
                        Pagadas
                    </button>
                </div>

                {/* FILTERS & ACTIONS */}
                <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative flex-1 w-full md:max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-shadow"
                            placeholder="Buscar por cliente, factura u observación..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {selectedIds.length > 0 && (
                        <button
                            onClick={handlePagar}
                            className="w-full md:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            <DollarSign className="w-5 h-5" />
                            Pagar ({selectedIds.length})
                        </button>
                    )}
                </div>

                {/* TABLE */}
                <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {activeTab === "recuperadas" && (
                                        <th className="px-6 py-4 text-left">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                checked={
                                                    facturasFiltradas.length >
                                                        0 &&
                                                    selectedIds.length ===
                                                        facturasFiltradas.length
                                                }
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                    )}
                                    {[
                                        "Factura",
                                        "Cliente",
                                        "Segmento",
                                        "Fecha Rec.",
                                        "Saldo Inicial",
                                        "Saldo Actual",
                                        "Recuperado",
                                        "Observación",
                                    ].map((head) => (
                                        <th
                                            key={head}
                                            className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                                        >
                                            {head}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {facturasFiltradas.length > 0 ? (
                                    facturasFiltradas.map((fact) => (
                                        <tr
                                            key={fact.id}
                                            className={`hover:bg-gray-50 transition-colors ${
                                                selectedIds.includes(fact.id)
                                                    ? "bg-blue-50"
                                                    : ""
                                            }`}
                                        >
                                            {activeTab === "recuperadas" && (
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                        checked={selectedIds.includes(
                                                            fact.id
                                                        )}
                                                        onChange={() =>
                                                            toggleSelectRow(
                                                                fact.id
                                                            )
                                                        }
                                                    />
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-mono font-bold text-gray-700">
                                                        {fact.nro_doc}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-800">
                                                        {fact.nombre_cliente ||
                                                            "-"}
                                                    </span>
                                                    <span className="text-xs text-gray-500 font-mono">
                                                        {fact.co_cli}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                    {fact.nombre_segmento}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                                {formatDate(
                                                    fact.fecha_recuperacion
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {formatCurrency(
                                                    fact.saldo_inicial
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {formatCurrency(
                                                    fact.saldo_actual
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-green-100 text-green-800">
                                                    {formatCurrency(
                                                        fact.monto_recuperado
                                                    )}
                                                </span>
                                            </td>
                                            <td
                                                className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate"
                                                title={fact.observacion}
                                            >
                                                {fact.observacion || (
                                                    <span className="text-gray-400 italic">
                                                        Sin observación
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={
                                                activeTab === "recuperadas"
                                                    ? 9
                                                    : 8
                                            }
                                            className="px-6 py-12 text-center text-gray-500"
                                        >
                                            No se encontraron facturas
                                            recuperadas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
