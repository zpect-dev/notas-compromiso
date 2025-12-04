import React, { useState, useEffect } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";

// Eliminamos 'nota' y 'router'. Ahora todo entra por props.
export default function ModalAbono({ isOpen, onClose, onConfirm }) {
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setComment("");
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!comment.trim()) return;

        setIsSubmitting(true);

        // 👇 MAGIA AQUÍ: Le pasamos el comentario al Padre.
        // Esperamos a que el padre termine (await) para quitar el loading o cerrar.
        try {
            await onConfirm(comment);
        } catch (error) {
            // Si el padre lanza error, quitamos el loading
            setIsSubmitting(false);
        }
        // Nota: Si el padre tiene éxito, el padre cerrará el modal (isOpen=false),
        // así que no hace falta hacer setIsSubmitting(false) en el éxito.
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-semibold leading-6 text-gray-900">
                            Confirmar Abono
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-4">
                        Indica la cantidad de abono
                    </p>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        autoFocus
                        className="block w-full rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                    />
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        disabled={!comment.trim() || isSubmitting}
                        onClick={handleSubmit}
                        className="cursor-pointer inline-flex items-center gap-2 justify-center rounded-md bg-yellow-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}
