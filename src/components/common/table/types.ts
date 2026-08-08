import type { PaginationState } from "@tanstack/react-table";

export interface TablePaginationConfig {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    rowCount?: number;
    pageSizeOptions?: number[];
    onChange: (pagination: PaginationState) => void;
}
