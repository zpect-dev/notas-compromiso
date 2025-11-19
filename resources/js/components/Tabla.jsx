export default function Tabla({ notas }) {
    console.log(notas);
    if (!notas || notas.length === 0) {
        return (
            <p className="text-center text-gray-500 p-8">
                No hay notas o facturas pendientes para mostrar.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                {/* Encabezado de la Tabla */}
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Código Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Segmento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vendedor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nota (Factura)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Compromiso (Fecha)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Debe (Monto)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Días Restantes
                        </th>
                    </tr>
                </thead>

                {/* Cuerpo de la Tabla */}
                <tbody className="bg-white divide-y divide-gray-200">
                    {notas.map((nota, index) => (
                        <tr
                            key={index}
                            className={
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                        >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {nota.co_cli}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {nota.cli_des}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {nota.co_seg}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {nota.co_ven}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                                {nota.fact_num}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {nota.fec_pagar}
                            </td>

                            {/* Formato del monto */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                                $
                                {new Intl.NumberFormat("es-VE").format(
                                    nota.cant_pagar
                                )}
                            </td>

                            {/* Días restantes */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                <span
                                    className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${
                                        nota.dias_restantes <= 30
                                            ? "bg-red-100 text-red-800"
                                            : "bg-green-100 text-green-800"
                                    }`}
                                >
                                    {nota.dias_restantes}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
