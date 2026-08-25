"use client";

import { useState, type ReactNode } from "react";
import type { Cell, Row, RowData } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { AlertCircle, ChevronDown, Database } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { useTableContext } from "./table-context";
import { TableSkeleton } from "./table-skeleton";

export interface TableContentProps {
    loadingRows?: number;
    className?: string;
}

function getColumnLabel<TData extends RowData>(cell: Cell<TData, unknown>): string {
    const { meta, header } = cell.column.columnDef;

    if (meta?.label) return meta.label;
    if (typeof header === "string") return header;

    return cell.column.id;
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

function MobileAccordionRow<TData extends RowData>({ row }: { row: Row<TData> }) {
    const [isOpen, setIsOpen] = useState(false);
    const [headerCellA, headerCellB, ...restCells] = row.getVisibleCells();

    return (
        <div>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-j-gray-100/60"
            >
                <div className="flex min-w-0 flex-1 items-start gap-4">
                    {headerCellA && (
                        <div className="flex min-w-0 shrink-0 flex-col gap-1">
                            <span className="truncate text-[10px] font-bold uppercase tracking-wide text-j-gray-400">
                                {getColumnLabel(headerCellA)}
                            </span>
                            <span className="truncate text-sm font-bold text-j-gray-700">
                                {flexRender(headerCellA.column.columnDef.cell, headerCellA.getContext())}
                            </span>
                        </div>
                    )}
                    {headerCellB && (
                        <div className="flex min-w-0 flex-1 flex-col gap-1 border-l border-j-gray-200 pl-4">
                            <span className="truncate text-[10px] font-bold uppercase tracking-wide text-j-gray-400">
                                {getColumnLabel(headerCellB)}
                            </span>
                            <span className="truncate text-sm font-bold text-j-gray-700">
                                {flexRender(headerCellB.column.columnDef.cell, headerCellB.getContext())}
                            </span>
                        </div>
                    )}
                </div>

                <ChevronDown
                    aria-hidden="true"
                    size={18}
                    className={twMerge(
                        "shrink-0 text-j-gray-400 transition-transform duration-200",
                        isOpen && "rotate-180",
                    )}
                />
            </button>

            {isOpen && (
                <div className="flex flex-col gap-3 border-t border-j-gray-100 bg-j-gray-100/40 px-4 py-4">
                    {restCells.map((cell) => (
                        <div
                            key={cell.id}
                            className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1"
                        >
                            <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-wide text-j-gray-500">
                                {getColumnLabel(cell)}:
                            </span>
                            <div className="min-w-0 text-sm text-j-gray-700">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                        </div>
                    ))}
                </div>
            )}
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

            <table className="hidden min-w-full text-left text-sm text-j-gray-600 lg:table">
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

            <div className="divide-y divide-j-gray-100 lg:hidden">
                {rows.map((row) => (
                    <MobileAccordionRow key={row.id} row={row} />
                ))}
            </div>
        </div>
    );
}
