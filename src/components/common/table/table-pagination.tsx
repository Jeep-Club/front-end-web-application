"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useTableContext } from "./table-context";

export interface TablePaginationProps {
    showPageSize?: boolean;
    showCount?: boolean;
    itemLabel?: string;
    className?: string;
}

export function TablePagination({ showPageSize = true, showCount = true, className }: TablePaginationProps) {
    const { table, pagination, isLoading, isFetching } = useTableContext();
    if (!pagination) return null;

    const totalPages = Math.max(table.getPageCount(), 0);
    const currentPage = totalPages === 0 ? 0 : pagination.pageIndex + 1;
    const totalElements = pagination.rowCount;
    const itemCount = typeof totalElements === "number"
        ? Math.max(0, Math.min(pagination.pageSize, totalElements - pagination.pageIndex * pagination.pageSize))
        : table.getRowModel().rows.length;
    const disabled = isLoading || isFetching;
    const pageSizeOptions = Array.from(new Set([...(pagination.pageSizeOptions ?? [5, 10, 25, 50]), pagination.pageSize])).sort((a, b) => a - b);
    const buttonClass = "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-j-gray-200 bg-j-white text-j-gray-600 transition-colors hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-blue-800 disabled:cursor-not-allowed disabled:opacity-40";

    return (
        <footer className={twMerge("grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-3 pt-4 lg:grid-cols-[1fr_auto_1fr]", className)}>
            <p className="text-sm tabular-nums text-j-gray-500">
                {showCount && typeof totalElements === "number" && `${itemCount.toLocaleString("pt-BR")} de ${totalElements.toLocaleString("pt-BR")} itens`}
            </p>
            <div className="col-span-2 row-start-2 flex items-center justify-center gap-1 lg:col-span-1 lg:col-start-2 lg:row-start-1">
                <button type="button" className={buttonClass} onClick={() => table.setPageIndex(0)} disabled={disabled || !table.getCanPreviousPage()} aria-label="Primeira página">
                    <ChevronsLeft size={16} aria-hidden="true" />
                </button>
                <button type="button" className={buttonClass} onClick={() => table.previousPage()} disabled={disabled || !table.getCanPreviousPage()} aria-label="Página anterior">
                    <ChevronLeft size={16} aria-hidden="true" />
                </button>
                <span className="min-w-[72px] text-center text-sm tabular-nums text-j-gray-600" aria-label={`Página ${currentPage} de ${totalPages}`}>
                    {currentPage} / {totalPages}
                </span>
                <button type="button" className={buttonClass} onClick={() => table.nextPage()} disabled={disabled || !table.getCanNextPage()} aria-label="Próxima página">
                    <ChevronRight size={16} aria-hidden="true" />
                </button>
                <button type="button" className={buttonClass} onClick={() => table.setPageIndex(Math.max(totalPages - 1, 0))} disabled={disabled || !table.getCanNextPage()} aria-label="Última página">
                    <ChevronsRight size={16} aria-hidden="true" />
                </button>
            </div>
            {showPageSize && <select
                value={pagination.pageSize}
                onChange={(event) => table.setPageSize(Number(event.target.value))}
                disabled={disabled}
                aria-label="Itens por página"
                className="col-start-2 row-start-1 justify-self-end rounded-lg border border-j-gray-200 bg-j-white px-2 py-1.5 text-sm text-j-gray-600 focus-visible:outline-2 focus-visible:outline-j-blue-800 disabled:opacity-60 lg:col-start-3"
            >
                {pageSizeOptions.map((size) => <option key={size} value={size}>{size} por página</option>)}
            </select>}
        </footer>
    );
}
