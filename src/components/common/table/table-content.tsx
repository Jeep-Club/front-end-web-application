"use client";

import type { ReactNode } from "react";
import type { RowData } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { AlertCircle, Database } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { useTableContext } from "./table-context";
import { TableSkeleton } from "./table-skeleton";

export interface TableContentProps {
    loadingRows?: number;
    className?: string;
}

function StateMessage({
    icon,
    children,
    tone = "default",
}: {
    icon: ReactNode;
    children: ReactNode;
    tone?: "default" | "danger";
}) {
    return (
        <div
            className={twMerge(
                "flex min-h-48 flex-col items-center justify-center gap-2 px-4 py-10 text-center text-sm text-j-gray-500",
                tone === "danger" && "text-j-red-500",
            )}
        >
            {icon}
            {children}
        </div>
    );
}

export function TableContent<TData extends RowData>({
    loadingRows = 5,
    className,
}: TableContentProps) {
    const { table, columnCount, isLoading, isFetching, error, emptyState } =
        useTableContext<TData>();

    if (isLoading) {
        return (
            <div className={twMerge("w-full overflow-x-auto", className)}>
                <TableSkeleton columns={columnCount} rows={loadingRows} />
            </div>
        );
    }

    if (error) {
        return (
            <StateMessage
                tone="danger"
                icon={<AlertCircle aria-hidden="true" size={34} />}
            >
                {error}
            </StateMessage>
        );
    }

    const rows = table.getRowModel().rows;

    if (!rows.length) {
        return (
            <StateMessage icon={<Database aria-hidden="true" size={34} />}>
                {emptyState ?? "Nenhum registro encontrado."}
            </StateMessage>
        );
    }

    return (
        <div
            className={twMerge("relative w-full overflow-x-auto", className)}
            aria-busy={isFetching}
        >
            {isFetching && (
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-j-yellow-100">
                    <div className="h-full w-1/2 animate-pulse rounded-full bg-j-yellow-400" />
                </div>
            )}

            <table className="min-w-full text-left text-sm text-j-gray-600">
                <thead className="border-b border-j-gray-200 bg-j-gray-100 text-xs uppercase tracking-wide text-j-blue-800">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    scope="col"
                                    className="whitespace-nowrap px-4 py-3.5 font-extrabold first:pl-6 last:pr-6"
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext(),
                                          )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="divide-y divide-j-gray-100 bg-j-white">
                    {rows.map((row) => (
                        <tr
                            key={row.id}
                            className="transition-colors hover:bg-j-gray-100/70"
                        >
                            {row.getVisibleCells().map((cell) => (
                                <td
                                    key={cell.id}
                                    className="whitespace-nowrap px-4 py-3.5 first:pl-6 last:pr-6"
                                >
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext(),
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
