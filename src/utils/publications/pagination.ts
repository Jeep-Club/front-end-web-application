export const PUBLICATION_PAGE_SIZES = [12, 24, 36, 48];
export const DEFAULT_PUBLICATION_PAGE_SIZE = 12;

export function parsePublicationPagination(params: Pick<URLSearchParams, "get">) {
    const requestedPage = Number(params.get("page"));
    const requestedSize = Number(params.get("size"));
    return {
        pageIndex: Number.isSafeInteger(requestedPage) && requestedPage >= 0 ? requestedPage : 0,
        pageSize: PUBLICATION_PAGE_SIZES.includes(requestedSize) ? requestedSize : DEFAULT_PUBLICATION_PAGE_SIZE,
    };
}

export function updatePublicationPagination(params: URLSearchParams, next: { pageIndex: number; pageSize: number }) {
    const current = parsePublicationPagination(params);
    const result = new URLSearchParams(params);
    const pageSize = PUBLICATION_PAGE_SIZES.includes(next.pageSize) ? next.pageSize : DEFAULT_PUBLICATION_PAGE_SIZE;
    const pageIndex = pageSize !== current.pageSize ? 0 : Number.isSafeInteger(next.pageIndex) && next.pageIndex >= 0 ? next.pageIndex : 0;
    result.set("page", String(pageIndex));
    result.set("size", String(pageSize));
    return result;
}