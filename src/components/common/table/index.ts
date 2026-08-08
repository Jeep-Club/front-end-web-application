import { TableContent } from "./table-content";
import { TableFilters } from "./table-filters";
import { TableHeader } from "./table-header";
import { TablePagination } from "./table-pagination";
import { TableRoot } from "./table-root";
import { TableSearch } from "./table-search";
import { TableSkeleton } from "./table-skeleton";

export type { TablePaginationConfig } from "./types";
export type { TableRootProps } from "./table-root";
export type { TableHeaderProps } from "./table-header";
export type { TableSearchProps } from "./table-search";
export type { TableFiltersProps } from "./table-filters";
export type { TableContentProps } from "./table-content";
export type { TablePaginationProps } from "./table-pagination";
export type { TableSkeletonProps } from "./table-skeleton";

export const Table = {
    Root: TableRoot,
    Header: TableHeader,
    Search: TableSearch,
    Filters: TableFilters,
    Content: TableContent,
    Pagination: TablePagination,
    Skeleton: TableSkeleton,
};

export default Table;
