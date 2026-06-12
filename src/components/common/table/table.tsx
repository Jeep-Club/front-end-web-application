"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { twMerge } from "tailwind-merge";
import { TableSkeleton } from "./table-skeleton";
import { Database } from "lucide-react";

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    isLoading?: boolean;
    className?: string;
}

export function Table<TData, TValue>({
    columns,
    data,
    isLoading = false,
    className,
}: DataTableProps<TData, TValue>) {
    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
    });

    if (isLoading) {
        return <TableSkeleton className={className} />;
    }

    return (
        <div className={twMerge("w-full overflow-x-auto rounded-lg bg-j-gray-700 border border-j-gray-400/80", className)}>
            <table className="w-full text-sm text-left text-j-gray-300">
                <thead className="text-xs uppercase bg-j-gray-600 text-j-gray-400">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} className="px-4 py-4 font-extrabold whitespace-nowrap">
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
                                          )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className="border-b border-j-gray-500/50 hover:bg-input-bg/30 transition-colors"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-4 py-3">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="px-4 py-12 text-center text-j-gray-400">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <Database size={36} className="opacity-50 text-j-gray-500 mb-2" />
                                    <span>Nenhum registo encontrado.</span>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}