import type { PaginationState, RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        // Rótulo simples usado no accordion mobile (Table.Content), já que
        // o header de uma coluna pode ser um componente interativo (ex.:
        // Table.Sortable) que não pode ser renderizado dentro do botão
        // que abre/fecha o card.
        label?: string;
    }
}

export interface TablePaginationConfig {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    rowCount?: number;
    pageSizeOptions?: number[];
    onChange: (pagination: PaginationState) => void;
}
