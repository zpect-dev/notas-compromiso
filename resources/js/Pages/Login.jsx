import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import Layout from "@/Layouts/Layout";

export default function Login({ errors }) {
    const { data, setData, post, processing } = useForm({
        usuario: "",
        clave: "",
    });
    const [show, setShow] = useState(false);

    function submit(e) {
        e.preventDefault();
        post("/login");
    }

    return (
        <Layout>
            <Head title="Iniciar sesión" />

            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Usuario
                            </label>
                            <input
                                type="text"
                                name="usuario"
                                value={data.usuario}
                                onChange={(e) =>
                                    setData("usuario", e.target.value)
                                }
                                className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Usuario"
                                disabled={processing}
                            />
                            {errors?.usuario && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.usuario}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Contraseña
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    type={show ? "text" : "password"}
                                    name="clave"
                                    value={data.clave}
                                    onChange={(e) =>
                                        setData("clave", e.target.value)
                                    }
                                    className="block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Contraseña"
                                    disabled={processing}
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-2 text-sm text-gray-500"
                                ></button>
                            </div>
                            {errors?.clave && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.clave}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                type="submit"
                                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg shadow flex items-center justify-center ${
                                    processing
                                        ? "opacity-70 cursor-not-allowed"
                                        : ""
                                }`}
                                disabled={processing}
                                aria-busy={processing}
                            >
                                {processing ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="animate-spin h-5 w-5 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                        />
                                    </svg>
                                ) : null}
                                <span>
                                    {processing ? "Ingresando..." : "Entrar"}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
