import { Head } from "@inertiajs/react";
import Layout from "@/Layouts/Layout";
import Tabla from "@/Components/Tabla";

export default function Home({ notas: notasData, errors }) {
    return (
        <Layout>
            <Head title="Página Principal" />

            <section className="container mx-auto p-6">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">
                    Notas de Entrega Pendientes
                </h2>

                {errors && Object.keys(errors).length > 0 && (
                    <div
                        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
                        role="alert"
                    >
                        <strong className="font-bold">¡Error!</strong>
                        <span className="block sm:inline">
                            Hubo problemas al cargar los datos.
                        </span>
                    </div>
                )}

                <Tabla notas={notasData} />
            </section>
        </Layout>
    );
}
