"use client";

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { TableProvider } from "./table-context";
import { TablePagination } from "./table-pagination";
import type { TablePaginationConfig } from "./types";

/** Shared pagination controls for card and row lists outside Table.Root. */
export function ListPagination({ pagination, itemLabel, isFetching = false }: {
    pagination: TablePaginationConfig;
    itemLabel: string;
    isFetching?: boolean;
}) {
    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data: [],
        columns: [],
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: pagination.pageCount,
        rowCount: pagination.rowCount,
        state: { pagination: { pageIndex: pagination.pageIndex, pageSize: pagination.pageSize } },
        onPaginationChange: (updater) => pagination.onChange(typeof updater === "function"
            ? updater({ pageIndex: pagination.pageIndex, pageSize: pagination.pageSize })
            : updater),
    });

    return <TableProvider value={{ table, pagination, columnCount: 0, isLoading: false, isFetching }}>
        <TablePagination itemLabel={itemLabel} />
    </TableProvider>;
}
