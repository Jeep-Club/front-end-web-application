import { publicationFeedFiltersSchema, type PublicationFeedFilters } from '@/schemas/publications/feed';

/** URL filters use canonical UTC Instants. Never normalize them through Date. */
export function parsePublicationFeedFilters(params: Pick<URLSearchParams, 'getAll'>) {
    const input: Record<string, unknown> = {};
    for (const key of ['type', 'publishedFrom', 'publishedTo']) {
        const values = params.getAll(key);
        if (values.length) input[key] = values.length === 1 ? values[0] : values;
    }
    return publicationFeedFiltersSchema.safeParse(input);
}

export function updatePublicationFeedFilters(params: URLSearchParams, next: PublicationFeedFilters) {
    const result = new URLSearchParams(params);
    for (const key of ['type', 'publishedFrom', 'publishedTo'] as const) {
        result.delete(key);
        if (next[key]) result.set(key, next[key]);
    }
    for (const key of ['publication', 'page', 'size']) result.delete(key);
    return result;
}
