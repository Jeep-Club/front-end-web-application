"use client";

import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

import { useTableContext } from "./table-context";

export interface TablePaginationProps {
    showPageSize?: boolean;
    className?: string;
}

function PaginationButton({
    label,
    children,
    ...props
}: React.ComponentProps<"button"> & { label: string }) {
    return (
        <button
            {...props}
            type="button"
            aria-label={label}
            title={label}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-j-gray-200 text-j-blue-800 transition-colors hover:border-j-yellow-400 hover:bg-j-yellow-100 focus-visible:outline-2 focus-visible:outline-j-yellow-400 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-j-gray-200 disabled:hover:bg-transparent"
        >
            {children}
        </button>
    );
}

export function TablePagination({
    showPageSize = true,
    className,
}: TablePaginationProps) {
    const { table, pagination, isLoading, isFetching } = useTableContext();

    if (!pagination) return null;

    const pageCount = Math.max(table.getPageCount(), 0);
    const displayedPage = pageCount === 0 ? 0 : pagination.pageIndex + 1;
    const pageSizeOptions = pagination.pageSizeOptions ?? [10, 20, 30, 50];
    const isDisabled = isLoading || isFetching;

    return (
        <footer
            className={twMerge(
                "flex flex-col gap-3 border-t border-j-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6",
                className,
            )}
        >
            <div className="text-xs text-j-gray-500">
                {typeof pagination.rowCount === "number"
                    ? `${pagination.rowCount} registro(s)`
                    : `Página ${displayedPage} de ${pageCount}`}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                {showPageSize && (
                    <label className="flex items-center gap-2 text-xs font-semibold text-j-gray-600">
                        Por página
                        <select
                            value={pagination.pageSize}
                            disabled={isDisabled}
                            onChange={(event) =>
                                table.setPageSize(Number(event.target.value))
                            }
                            className="h-9 rounded-lg border border-j-gray-200 bg-j-white px-2 text-sm text-j-gray-700 outline-none focus:border-j-yellow-400 focus:ring-2 focus:ring-j-yellow-300/30 disabled:opacity-60"
                        >
                            {pageSizeOptions.map((pageSize) => (
                                <option key={pageSize} value={pageSize}>
                                    {pageSize}
                                </option>
                            ))}
                        </select>
                    </label>
                )}

                <span className="min-w-24 text-center text-xs text-j-gray-500">
                    Página {displayedPage} de {pageCount}
                </span>

                <div className="flex items-center gap-1">
                    <PaginationButton
                        label="Primeira página"
                        disabled={isDisabled || !table.getCanPreviousPage()}
                        onClick={() => table.setPageIndex(0)}
                    >
                        <ChevronsLeft size={18} />
                    </PaginationButton>
                    <PaginationButton
                        label="Página anterior"
                        disabled={isDisabled || !table.getCanPreviousPage()}
                        onClick={() => table.previousPage()}
                    >
                        <ChevronLeft size={18} />
                    </PaginationButton>
                    <PaginationButton
                        label="Próxima página"
                        disabled={isDisabled || !table.getCanNextPage()}
                        onClick={() => table.nextPage()}
                    >
                        <ChevronRight size={18} />
                    </PaginationButton>
                    <PaginationButton
                        label="Última página"
                        disabled={isDisabled || !table.getCanNextPage()}
                        onClick={() => table.setPageIndex(Math.max(pageCount - 1, 0))}
                    >
                        <ChevronsRight size={18} />
                    </PaginationButton>
                </div>
            </div>
        </footer>
    );
}
