/**
 * Formato padrao de paginacao do Spring Data (Page<T>).
 */
interface PageSort {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
}

interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
    empty: boolean;
    sort: PageSort;
}
