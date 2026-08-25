"use client";

import { useEffect, useState } from "react";
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
    showCount?: boolean;
    itemLabel?: string;
    className?: string;
}

function getPageItems(current: number, total: number): (number | "ellipsis")[] {
    if (total <= 0) return [];
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const items: (number | "ellipsis")[] = [1];

    if (current > 3) items.push("ellipsis");

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let page = start; page <= end; page++) {
        items.push(page);
    }

    if (current < total - 2) items.push("ellipsis");

    items.push(total);

    return items;
}

function NavButton({
    label,
    active,
    children,
    className,
    ...props
}: React.ComponentProps<"button"> & { label: string; active?: boolean }) {
    return (
        <button
            {...props}
            type="button"
            aria-label={label}
            aria-current={active ? "page" : undefined}
            title={label}
            className={twMerge(
                "flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg px-2 text-sm font-semibold text-j-gray-600 transition-colors hover:bg-j-white hover:text-j-blue-800 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-j-yellow-400 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-j-gray-600 disabled:hover:shadow-none",
                active && "bg-j-yellow-300 text-j-blue-800 hover:bg-j-yellow-300 hover:text-j-blue-800",
                className,
            )}
        >
            {children}
        </button>
    );
}

export function TablePagination({
    showPageSize = true,
    showCount = true,
    itemLabel = "registro",
    className,
}: TablePaginationProps) {
    const { table, pagination, isLoading, isFetching } = useTableContext();

    const pageCount = pagination ? Math.max(table.getPageCount(), 0) : 0;
    const displayedPage = pageCount === 0 ? 0 : (pagination?.pageIndex ?? 0) + 1;
    const pageSizeOptions = pagination?.pageSizeOptions ?? [10, 20, 30, 50];
    const isDisabled = isLoading || isFetching;

    const [pageInput, setPageInput] = useState(String(displayedPage));

    useEffect(() => {
        setPageInput(String(displayedPage));
    }, [displayedPage]);

    if (!pagination) return null;

    function commitPageInput() {
        const parsed = Number(pageInput);

        if (Number.isInteger(parsed) && parsed >= 1 && parsed <= pageCount) {
            table.setPageIndex(parsed - 1);
        } else {
            setPageInput(String(displayedPage));
        }
    }

    const pageItems = getPageItems(displayedPage, pageCount);

    return (
        <footer
            className={twMerge(
                "flex flex-col items-center gap-6 rounded-2xl border border-j-gray-200 bg-j-white px-4 py-5 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:py-4 md:px-6",
                className,
            )}
        >
            <div className="flex flex-col items-center gap-4 text-xs font-semibold text-j-gray-600 sm:flex-row sm:flex-wrap sm:justify-start sm:gap-3">
                {showCount && typeof pagination.rowCount === "number" && (
                    <span className="whitespace-nowrap font-medium text-j-gray-500">
                        {pagination.rowCount} {itemLabel}(s)
                    </span>
                )}

                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] sm:justify-start sm:text-xs">
                    <span className="flex items-center gap-1 whitespace-nowrap">
                        Página
                        <input
                            type="number"
                            min={1}
                            max={pageCount}
                            value={pageInput}
                            disabled={isDisabled || pageCount === 0}
                            onChange={(event) => setPageInput(event.target.value)}
                            onBlur={commitPageInput}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    commitPageInput();
                                }
                            }}
                            className="h-7 w-10 [appearance:textfield] rounded-lg border border-j-gray-200 bg-j-white text-center text-xs font-semibold text-j-gray-700 outline-none focus:border-j-yellow-400 focus:ring-2 focus:ring-j-yellow-300/30 disabled:cursor-not-allowed disabled:opacity-60 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        de {pageCount}
                    </span>

                    {showPageSize && (
                        <>
                            <span className="h-3.5 w-px bg-j-gray-200" aria-hidden="true" />

                            <label className="flex items-center gap-1.5">
                                Por página
                                <select
                                    value={pagination.pageSize}
                                    disabled={isDisabled}
                                    onChange={(event) =>
                                        table.setPageSize(Number(event.target.value))
                                    }
                                    className="h-7 cursor-pointer rounded-lg border border-j-gray-200 bg-j-white px-1.5 text-xs font-semibold text-j-gray-700 outline-none transition-colors hover:border-j-gray-300 focus:border-j-yellow-400 focus:ring-2 focus:ring-j-yellow-300/30 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {pageSizeOptions.map((pageSize) => (
                                        <option key={pageSize} value={pageSize}>
                                            {pageSize}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1">
                <NavButton
                    label="Primeira página"
                    disabled={isDisabled || !table.getCanPreviousPage()}
                    onClick={() => table.setPageIndex(0)}
                >
                    <ChevronsLeft size={16} />
                </NavButton>
                <NavButton
                    label="Página anterior"
                    disabled={isDisabled || !table.getCanPreviousPage()}
                    onClick={() => table.previousPage()}
                >
                    <ChevronLeft size={16} />
                </NavButton>

                {pageItems.map((item, index) =>
                    item === "ellipsis" ? (
                        <span
                            key={`ellipsis-${index}`}
                            className="flex h-8 min-w-8 items-center justify-center text-sm text-j-gray-400"
                        >
                            …
                        </span>
                    ) : (
                        <NavButton
                            key={item}
                            label={`Página ${item}`}
                            active={item === displayedPage}
                            disabled={isDisabled}
                            onClick={() => table.setPageIndex(item - 1)}
                        >
                            {item}
                        </NavButton>
                    ),
                )}

                <NavButton
                    label="Próxima página"
                    disabled={isDisabled || !table.getCanNextPage()}
                    onClick={() => table.nextPage()}
                >
                    <ChevronRight size={16} />
                </NavButton>
                <NavButton
                    label="Última página"
                    disabled={isDisabled || !table.getCanNextPage()}
                    onClick={() => table.setPageIndex(Math.max(pageCount - 1, 0))}
                >
                    <ChevronsRight size={16} />
                </NavButton>
            </div>
        </footer>
    );
}
