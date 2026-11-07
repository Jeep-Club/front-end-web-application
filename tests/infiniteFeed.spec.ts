import { nextFeedPage, mergeFeedPages } from '@/utils/publications/infiniteFeed';

const page = (overrides: Partial<PageResponse<{ id: number }>> = {}): PageResponse<{ id: number }> => ({
    content: [{ id: 1 }], number: 0, size: 12, totalPages: 3, totalElements: 25,
    first: true, last: false, empty: false, numberOfElements: 1, ...overrides,
});

it('requests the following page while more publications exist', () => {
    expect(nextFeedPage(page())).toBe(1);
    expect(nextFeedPage(page({ number: 1 }))).toBe(2);
});

it('stops at the last page or an empty response', () => {
    expect(nextFeedPage(page({ last: true }))).toBeUndefined();
    expect(nextFeedPage(page({ number: 2 }))).toBeUndefined();
    expect(nextFeedPage(page({ content: [] }))).toBeUndefined();
});

it('appends pages in order without showing duplicate publications', () => {
    expect(mergeFeedPages([{ content: [{ id: 3 }, { id: 2 }] }, { content: [{ id: 2 }, { id: 1 }] }]))
        .toEqual([{ id: 3 }, { id: 2 }, { id: 1 }]);
    expect(mergeFeedPages([])).toEqual([]);
});
