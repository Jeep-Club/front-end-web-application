'use client';

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface Props<T> {
    columns: (keyof T)[];
    data: T[];
    currentPage: number;
    onView?: (row: T) => void;
}

export default function SimpleTable<T>({
    columns, 
    data, 
    currentPage, 
    onView 
}: Props<T>) {

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handlePageChange = (newPage: number) => {
        // Clona os parâmetros atuais para não deletar os existentes (ex: sort, filter)
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        
        // Empurra a nova URL na pilha de navegação
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((col) => (
                                <th key={String(col)} className="px-4 py-3 font-semibold text-gray-700">
                                    {String(col)}
                                </th>
                            ))}
                            {onView && <th className="px-4 py-3 font-semibold text-gray-700">Ações</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                                {columns.map((col) => (
                                    <td key={String(col)} className="px-4 py-3 text-gray-600">
                                        {String(row[col])}
                                    </td>
                                ))}
                                {onView && (
                                    <td className="px-4 py-3">
                                        <button 
                                            onClick={() => onView(row)}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Ver
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + (onView ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
                                    Nenhum registro encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Controles de Paginação */}
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                    Página {currentPage}
                </span>
                <div className="flex gap-2">
                    <button
                        disabled={currentPage <= 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="px-4 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Anterior
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
                    >
                        Próxima
                    </button>
                </div>
            </div>
        </div>
    );
}
