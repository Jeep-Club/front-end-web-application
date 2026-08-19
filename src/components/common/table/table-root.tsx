"use client";

import type { ReactNode } from "react";
import {
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
    type RowData,
    type TableOptions,
    type Updater,
} from "@tanstack/react-table";
import { twMerge } from "tailwind-merge";

import { TableProvider } from "./table-context";
import type { TablePaginationConfig } from "./types";

export interface TableRootProps<TData extends RowData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    children: ReactNode;
    getRowId?: TableOptions<TData>["getRowId"];
    pagination?: TablePaginationConfig;
    isLoading?: boolean;
    isFetching?: boolean;
    error?: ReactNode;
    emptyState?: ReactNode;
    className?: string;
}

export function TableRoot<TData extends RowData, TValue>({
    columns,
    data,
    children,
    getRowId,
    pagination,
    isLoading = false,
    isFetching = false,
    error,
    emptyState,
    className,
}: TableRootProps<TData, TValue>) {
    const paginationState = pagination
        ? { pageIndex: pagination.pageIndex, pageSize: pagination.pageSize }
        : undefined;

    const handlePaginationChange = pagination
        ? (updater: Updater<NonNullable<typeof paginationState>>) => {
              const nextPagination =
                  typeof updater === "function"
                      ? updater({
                            pageIndex: pagination.pageIndex,
                            pageSize: pagination.pageSize,
                        })
                      : updater;

              pagination.onChange(nextPagination);
          }
        : undefined;

    // TanStack Table v8 is safe here, but is conservatively flagged by the
    // React Compiler compatibility lint rule because it returns mutable APIs.
    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        defaultColumn: {
            cell: ({ getValue }) => {
                const value = getValue();

                return value === null || value === undefined || value === ""
                    ? "—"
                    : String(value);
            },
        },
        getCoreRowModel: getCoreRowModel(),
        getRowId,
        manualPagination: Boolean(pagination),
        pageCount: pagination?.pageCount,
        rowCount: pagination?.rowCount,
        state: paginationState ? { pagination: paginationState } : undefined,
        onPaginationChange: handlePaginationChange,
    });

    return (
        <TableProvider
            value={{
                table,
                columnCount: table.getVisibleLeafColumns().length,
                isLoading,
                isFetching,
                error,
                emptyState,
                pagination,
            }}
        >
            <section
                className={twMerge(
                    "relative w-full overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm",
                    className,
                )}
            >
                {children}
            </section>
        </TableProvider>
    );
}
