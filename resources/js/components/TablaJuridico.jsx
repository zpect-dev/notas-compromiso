import React, { useState } from "react";
import {
    Check,
    X,
    MessageSquare,
    Search,
    FileText,
    Filter,
    Calendar,
    DollarSign,
    AlertCircle,
} from "lucide-react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import { Save } from "lucide-react";

import ModalConvenio from "./modal/ModalConvenio"; // Import ModalConvenio
// import ModalRechazo from "../components/modal/ModalRechazo"; // Si se requiere rechazar/observar facturas

export default function TablaJuridico({ facturas, cliente, archivos }) {
    // 1. ESTADOS
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("todos"); // todos, recuperados, pendientes
    const [isConvenioModalOpen, setIsConvenioModalOpen] = useState(false); // State for Convenio Modal

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
    const facturasFiltradas =
        facturas?.filter((fact) => {
            const busqueda = searchTerm.toLowerCase();
            const nroDoc = fact.nro_factura?.toString().toLowerCase() || "";
            const obs = fact.observacion?.toLowerCase() || "";

            const matchesSearch =
                !searchTerm ||
                nroDoc.includes(busqueda) ||
                obs.includes(busqueda);

            let matchesStatus = true;
            if (filterStatus === "pendientes") {
                matchesStatus = fact.estado_recuperacion === "PENDIENTE";
            } else if (filterStatus === "recuperados") {
                matchesStatus = fact.estado_recuperacion === "RECUPERADO";
            }

            return matchesSearch && matchesStatus;
        }) || [];

    // 5. FORMATO DE MONEDA ESTÁNDAR
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined || amount === "")
            return "-";
        return new Intl.NumberFormat("es-VE", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    // 6. LÓGICA DE COLORES DE FILA
    const getRowClass = (fact, index) => {
        // Base zebra
        const zebra = index % 2 === 0 ? "bg-white" : "bg-gray-50";
        let defaultStyle = `${zebra} border-l-4 hover:bg-gray-100 transition-colors`;

        // Si está recuperado (saldo <= 0) -> Verde
        if (fact.estado_recuperacion === "RECUPERADO") {
            return `${defaultStyle} border-green-500 bg-green-50 hover:bg-green-100`;
        }

        // Si tiene días de morosidad altos (> 90 por ejemplo) -> Rojo Intenso
        if (fact.dias_morosidad > 90) {
            return `${defaultStyle} border-red-600 bg-red-50 hover:bg-red-100`;
        }

        // Si tiene morosidad pero no tanta -> Rojo más suave o Naranja
        if (fact.dias_morosidad > 30) {
            return `${defaultStyle} border-orange-500 bg-orange-50 hover:bg-orange-100`;
        }

        // Default pendiente normal
        return `${defaultStyle} border-gray-300`;
    };

    if (!facturas || facturas.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
                <div className="p-3 bg-gray-100 rounded-full mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                    Sin Facturas
                </h3>
                <p className="text-gray-500 mt-1">
                    Este cliente no tiene facturas registradas en este criterio.
                </p>
            </div>
        );
    }

    // Totales para mostrar en cards superiores
    const totalDeuda = facturasFiltradas.reduce(
        (acc, curr) => acc + parseFloat(curr.saldo_actual || 0),
        0
    );
    const totalOriginal = facturasFiltradas.reduce(
        (acc, curr) => acc + parseFloat(curr.monto_factura || 0),
        0
    );

    // 7. AR CHIVOS
    const [uploadingKey, setUploadingKey] = useState(null);

    const handleFileClick = (key, url) => {
        if (url) {
            window.open(url, "_blank");
        } else {
            console.log("Clicked key:", key);
            if (key === "convenio_pago") {
                setIsConvenioModalOpen(true);
            } else {
                setUploadingKey(key);
                document.getElementById("fileInput").click();
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file || !uploadingKey) return;

        const formData = new FormData();
        formData.append("archivo", file);
        formData.append("tipo", uploadingKey);

        uploadFile(formData);

        // Reset input
        e.target.value = null;
    };

    const handleConvenioUpload = ({ file, frecuencia, cantidad }) => {
        const formData = new FormData();
        formData.append("archivo", file);
        formData.append("tipo", "convenio_pago");
        if (frecuencia) formData.append("frecuencia_convenio", frecuencia);
        if (cantidad) formData.append("cantidad_pagar", cantidad);

        uploadFile(formData);
    };

    const uploadFile = (formData) => {
        router.post(`/juridico/${cliente.codigo.trim()}/archivo`, formData, {
            onSuccess: () => {
                toast.success("Archivo subido correctamente");
                setUploadingKey(null);
                setIsConvenioModalOpen(false); // Close modal if open
            },
            onError: () => {
                toast.error("Error al subir el archivo");
                setUploadingKey(null);
            },
        });
    };

    // 8. MANEJO DE OBSERVACIONES Y RECUPERACIÓN
    const [localObservations, setLocalObservations] = useState({});

    const handleObservationChange = (nroDoc, value) => {
        setLocalObservations((prev) => ({
            ...prev,
            [nroDoc]: value,
        }));
    };

    const handleMarcarRecuperado = (fact) => {
        const obs =
            localObservations[fact.nro_factura] !== undefined
                ? localObservations[fact.nro_factura]
                : fact.observacion_manual || "";

        if (
            confirm(
                `¿Desea marcar la factura ${fact.nro_factura} como RECUPERADA?`
            )
        ) {
            router.post(
                route("juridico.recuperar"),
                {
                    nro_doc: fact.nro_factura,
                    co_cli: cliente.codigo,
                    observacion: obs,
                },
                {
                    onSuccess: () => {
                        toast.success("Factura marcada como recuperada");
                    },
                    preserveScroll: true,
                }
            );
        }
    };

    const handleGuardarObservacion = (fact) => {
        const obs =
            localObservations[fact.nro_factura] !== undefined
                ? localObservations[fact.nro_factura]
                : fact.observacion_manual || "";

        // Optional: check if obs is empty or unchanged, but user might want to save empty to clear it?
        // Let's just allow saving whatever is there.

        router.post(
            route("juridico.observacion"),
            {
                nro_doc: fact.nro_factura,
                co_cli: cliente.codigo,
                observacion: obs,
            },
            {
                onSuccess: () => {
                    toast.success("Observación guardada");
                },
                preserveScroll: true,
            }
        );
    };

    const fileButtons = [
        { key: "solicitud_pago", label: "Solicitud de pago" },
        { key: "retiro_mercancia", label: "Retiro de mercancia" },
        { key: "convenio_pago", label: "Convenio de pago" },
        { key: "cobranza_extrajudicial", label: "Cobranza extrajudicial" },
    ];

    return (
        <div className="space-y-4">
            {/* HIDDEN INPUT */}
            <input
                type="file"
                id="fileInput"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
            />

            {/* BOTONES ARCHIVOS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {fileButtons.map((btn) => {
                    const url = archivos?.[btn.key];
                    const isActive = !!url;

                    return (
                        <button
                            key={btn.key}
                            onClick={() => handleFileClick(btn.key, url)}
                            className={`p-3 rounded-lg text-sm font-bold shadow-sm transition-all border ${
                                isActive
                                    ? "bg-yellow-300 text-yellow-900 border-yellow-400 hover:bg-yellow-400 hover:scale-105"
                                    : "bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200 hover:text-gray-500"
                            }`}
                        >
                            {btn.label}
                        </button>
                    );
                })}
            </div>

            {/* --- BARRA DE CONTROL --- */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                {/* BUSCADOR */}
                <div className="md:col-span-5 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                        placeholder="Buscar factura..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* FILTROS DE ESTADO */}
                <div className="md:col-span-4 flex items-center justify-center md:justify-start">
                    <div className="flex p-1 bg-gray-100 rounded-lg w-full max-w-xs">
                        {["todos", "pendientes", "recuperados"].map(
                            (status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`flex-1 px-3 py-1.5 text-xs font-bold rounded-md transition-all uppercase tracking-wide ${
                                        filterStatus === status
                                            ? "bg-white text-gray-900 shadow-sm scale-105"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    {status}
                                </button>
                            )
                        )}
                    </div>
                </div>

                {/* INFO RESUMEN */}
                <div className="md:col-span-3 text-right">
                    <div className="text-xs text-gray-500 uppercase font-semibold">
                        Deuda Total Filtrada
                    </div>
                    <div className="text-xl font-bold text-red-600 font-mono tracking-tight">
                        {formatCurrency(totalDeuda)}
                    </div>
                </div>
            </div>

            {/* --- TABLA --- */}
            <div className="overflow-x-auto overflow-y-auto max-h-[75vh] shadow-lg rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                            {[
                                "Factura",
                                "Segmento",
                                "Emisión",
                                "Vencimiento",
                                "Días Mora",
                                "Monto Original",
                                "Saldo Inicial Jurídico",
                                "Saldo Actual",
                                "Estado",
                                "Último Abono",
                                "Observaciones",
                                "Acciones",
                            ].map((header) => (
                                <th
                                    key={header}
                                    className={`px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider ${
                                        header === "Observaciones"
                                            ? "min-w-[300px]"
                                            : ""
                                    }`}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 bg-white">
                        {facturasFiltradas.length > 0 ? (
                            facturasFiltradas.map((fact, index) => (
                                <tr
                                    key={fact.nro_factura}
                                    className={getRowClass(fact, index)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-mono font-bold text-gray-700">
                                                {fact.nro_factura}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                            {fact.nombre_segmento || "-"}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {formatDate(fact.emision)}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <div className="flex items-center gap-1 font-medium">
                                            <Calendar className="w-3 h-3 text-gray-400" />
                                            {formatDate(fact.vencimiento)}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {fact.dias_morosidad > 0 ? (
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    fact.dias_morosidad > 90
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-orange-100 text-orange-800"
                                                }`}
                                            >
                                                {fact.dias_morosidad} días
                                            </span>
                                        ) : (
                                            <span className="text-green-600 text-xs font-bold">
                                                Al día
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                                        {formatCurrency(fact.monto_factura)}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                        {formatCurrency(fact.saldo_inicial)}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div
                                            className={`text-sm font-bold font-mono ${
                                                parseFloat(fact.saldo_actual) >
                                                0.01
                                                    ? "text-red-600"
                                                    : "text-green-600"
                                            }`}
                                        >
                                            {formatCurrency(fact.saldo_actual)}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {fact.estado_recuperacion ===
                                        "RECUPERADO" ? (
                                            <span className="inline-flex w-28 justify-center items-center px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                                                <Check className="w-3 h-3 mr-1" />{" "}
                                                RECUPERADO
                                            </span>
                                        ) : (
                                            <span className="inline-flex w-28 justify-center items-center px-2 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                <AlertCircle className="w-3 h-3 mr-1" />{" "}
                                                PENDIENTE
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {fact.ultimo_cobro_fecha ? (
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-700">
                                                    {formatDate(
                                                        fact.ultimo_cobro_fecha
                                                    )}
                                                </span>
                                                <span className="text-xs text-green-600 font-medium">
                                                    {formatCurrency(
                                                        fact.ultimo_cobro_monto
                                                    )}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs">
                                                - Sin abonos -
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {fact.estado_recuperacion ===
                                        "PENDIENTE" ? (
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    title={
                                                        fact.observacion_manual ||
                                                        ""
                                                    }
                                                    className="w-full border-2 rounded-lg text-sm transition-all p-2 font-medium border-white bg-white/50 focus:bg-white focus:border-white focus:ring-4 focus:ring-white text-gray-700 placeholder-white/50"
                                                    placeholder="Escribir observación..."
                                                    value={
                                                        localObservations[
                                                            fact.nro_factura
                                                        ] !== undefined
                                                            ? localObservations[
                                                                  fact
                                                                      .nro_factura
                                                              ]
                                                            : fact.observacion_manual ||
                                                              ""
                                                    }
                                                    onChange={(e) =>
                                                        handleObservationChange(
                                                            fact.nro_factura,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <button
                                                    onClick={() =>
                                                        handleGuardarObservacion(
                                                            fact
                                                        )
                                                    }
                                                    className="mt-1 flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded hover:bg-blue-100 transition-colors"
                                                >
                                                    <Save className="w-3 h-3" />
                                                    Guardar Obs.
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">
                                                {fact.observacion || "-"}
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        {fact.estado_manual == 2 ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                                <DollarSign className="w-3 h-3 mr-1" />
                                                PAGADO
                                            </span>
                                        ) : fact.estado_manual == 1 ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                                                <Check className="w-3 h-3 mr-1" />
                                                OK
                                            </span>
                                        ) : fact.estado_recuperacion ===
                                          "PENDIENTE" ? (
                                            <button
                                                onClick={() =>
                                                    handleMarcarRecuperado(fact)
                                                }
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Recuperado
                                            </button>
                                        ) : (
                                            <span className="text-gray-400 text-xs">
                                                -
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="12"
                                    className="px-6 py-12 text-center text-gray-500"
                                >
                                    <div className="flex flex-col items-center">
                                        <Filter className="w-10 h-10 text-gray-200 mb-3" />
                                        <p className="font-medium text-gray-600">
                                            No se encontraron facturas
                                        </p>
                                        <p className="text-sm">
                                            Prueba ajustando los filtros de
                                            búsqueda.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="text-xs text-gray-400 text-center mt-4">
                Mostrando {facturasFiltradas.length} documentos
            </div>

            <ModalConvenio
                isOpen={isConvenioModalOpen}
                onClose={() => setIsConvenioModalOpen(false)}
                onUpload={handleConvenioUpload}
            />
        </div>
    );
}
