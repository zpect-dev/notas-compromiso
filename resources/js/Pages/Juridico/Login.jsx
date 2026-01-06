import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import Layout from "@/Layouts/Layout";

export default function JuridicoLogin({ errors }) {
    const { data, setData, post, processing } = useForm({
        username: "",
        password: "",
    });
    const [show, setShow] = useState(false);

    function submit(e) {
        e.preventDefault();
        post(route("juridico.login"));
    }

    return (
        <Layout>
            <Head title="Jurídico - Iniciar sesión" />

            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                        Acceso Jurídico
                    </h2>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Usuario
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={data.username}
                                onChange={(e) =>
                                    setData("username", e.target.value)
                                }
                                className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Usuario"
                                disabled={processing}
                            />
                            {errors?.username && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.username}
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
                                    name="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    className="block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Contraseña"
                                    disabled={processing}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShow(!show)}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    {show ? "Ocultar" : "Mostrar"}
                                </button>
                            </div>
                            {errors?.password && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between mt-6">
                            <button
                                type="submit"
                                className={`w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 rounded-lg shadow transition duration-200 flex items-center justify-center ${
                                    processing
                                        ? "opacity-70 cursor-not-allowed"
                                        : ""
                                }`}
                                disabled={processing}
                            >
                                {processing ? "Validando..." : "Ingresar"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
