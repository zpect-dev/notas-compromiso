import React, { useState } from "react";
import { X, Upload, Save } from "lucide-react";

export default function ModalConvenio({ isOpen, onClose, onUpload }) {
    const [file, setFile] = useState(null);
    const [frecuencia, setFrecuencia] = useState("");
    const [cantidad, setCantidad] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!file || !frecuencia || !cantidad) {
            alert("Todos los campos son obligatorios");
            return;
        }

        setLoading(true);
        // Simulate async if needed, but here we just pass data up
        onUpload({ file, frecuencia, cantidad });
        setLoading(false);
        handleClose();
    };

    const handleClose = () => {
        setFile(null);
        setFrecuencia("");
        setCantidad("");
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                {/* Header */}
                <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <Upload className="w-5 h-5 text-blue-200" />
                        Subir Convenio de Pago
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-blue-100 hover:text-white hover:bg-white/20 p-1 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* File Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">
                            Archivo del Convenio (PDF)
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-300 border-dashed rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-3 text-blue-500" />
                                    <p className="mb-2 text-sm text-gray-500 font-semibold">
                                        {file
                                            ? file.name
                                            : "Click para subir PDF"}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        PDF (MAX. 10MB)
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf"
                                    onChange={(e) => setFile(e.target.files[0])}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Frecuencia Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">
                            Frecuencia de Pago
                        </label>
                        <select
                            value={frecuencia}
                            onChange={(e) => setFrecuencia(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                        >
                            <option value="">Seleccione una frecuencia</option>
                            <option value="Semanal">Semanal</option>
                            <option value="Quincenal">Quincenal</option>
                            <option value="Mensual">Mensual</option>
                            <option value="Trimestral">Trimestral</option>
                            <option value="Unico">Pago Único</option>
                        </select>
                    </div>

                    {/* Cantidad Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">
                            Cantidad a Pagar ($)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={cantidad}
                            onChange={(e) => setCantidad(e.target.value)}
                            placeholder="Ej: 150.00"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? "Guardando..." : "Guardar Convenio"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
