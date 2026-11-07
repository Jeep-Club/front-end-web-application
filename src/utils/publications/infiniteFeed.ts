/** Stop on the last/empty page, even if the total changed between requests. */
export function nextFeedPage<T>(page: PageResponse<T>): number | undefined {
    if (page.last || !page.content.length || page.number + 1 >= page.totalPages) return undefined;
    return page.number + 1;
}

/** New publications can shift page offsets while scrolling; never repeat a card. */
export function mergeFeedPages<T extends { id: number }>(pages: { content: T[] }[]): T[] {
    const items = new Map<number, T>();
    for (const page of pages) {
        for (const item of page.content) {
            if (!items.has(item.id)) items.set(item.id, item);
        }
    }
    return [...items.values()];
}
