"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { RowData, Table as TanStackTable } from "@tanstack/react-table";

import type { TablePaginationConfig } from "./types";

export interface TableContextValue<TData extends RowData> {
    table: TanStackTable<TData>;
    columnCount: number;
    isLoading: boolean;
    isFetching: boolean;
    error?: ReactNode;
    emptyState?: ReactNode;
    pagination?: TablePaginationConfig;
}

const TableContext = createContext<TableContextValue<unknown> | null>(null);

interface TableProviderProps<TData extends RowData> {
    value: TableContextValue<TData>;
    children: ReactNode;
}

export function TableProvider<TData extends RowData>({
    value,
    children,
}: TableProviderProps<TData>) {
    return (
        <TableContext.Provider value={value as unknown as TableContextValue<unknown>}>
            {children}
        </TableContext.Provider>
    );
}

export function useTableContext<TData extends RowData = RowData>() {
    const context = useContext(TableContext);

    if (!context) {
        throw new Error("Os componentes Table devem ser usados dentro de Table.Root.");
    }

    return context as unknown as TableContextValue<TData>;
}
