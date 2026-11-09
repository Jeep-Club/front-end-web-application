import type { QueryClient } from '@tanstack/react-query';

export function publicationAdministrationHref(type: 'EVENT' | 'NOTICE' | 'SERVICE', params?: Pick<URLSearchParams, 'get'>, id?: number) {
    const area = { EVENT: 'event', NOTICE: 'notice', SERVICE: 'service' }[type];
    const keys = ['page', 'size', 'view', ...(type === 'EVENT' ? ['sort'] : ['publishedFrom', 'publishedTo'])];
    const context = new URLSearchParams();
    for (const key of keys) {
        const value = params?.get(key);
        if (value) context.set(key, value);
    }
    const query = context.toString();
    return `/admin/publications/${area}${id === undefined ? '' : `/${id}`}${query ? `?${query}` : ''}`;
}

/** Different DTOs share identity, not cache shape. Keep admin, published, feed and billing consumers coherent. */
export async function invalidatePublicationAdministration(client: QueryClient, type: 'EVENT' | 'NOTICE' | 'SERVICE', id: number, options: { deleted?: boolean; billing?: boolean; inline?: boolean } = {}) {
    const resource = { EVENT: 'events', NOTICE: 'notices', SERVICE: 'services' }[type];
    if (options.deleted) {
        for (const queryKey of [['publications', 'admin', resource, 'detail', id], ['publications', 'detail', id]]) {
            await client.cancelQueries({ queryKey });
            // Removing an observed query recreates it while navigation is pending, causing a spurious 404.
            // Clear its entity until unmount; inactive entries can be removed immediately.
            client.setQueriesData({ queryKey, type: 'active' }, null);
            client.removeQueries({ queryKey, type: 'inactive' });
        }
    }
    const keys: unknown[][] = [['publications', 'admin', resource], ['publications', 'feed'], ['publications', 'detail', id]];
    if (type === 'SERVICE') keys.push(['publications', 'member', 'services'], ['publications', 'service-publication-requests'], ['publications', 'service-publication-change-requests']);
    if (options.billing || options.inline) keys.push(['billing', 'dashboard'], ['billing', 'member-charges'], ['billing', 'cycles'], ['billing', 'refunds']);
    if (options.inline) keys.push(['billing', 'charge-definitions'], ['publications', 'admin', 'event-charge-catalog']);
    await Promise.all(keys.map(queryKey => client.invalidateQueries({
        queryKey,
        refetchType: 'active',
        // A deleted detail must not be fetched while navigation is pending, but
        // active lists still need to refresh when deletion starts from a menu.
        predicate: query => !options.deleted || !(
            (query.queryKey[1] === 'admin' && query.queryKey[3] === 'detail' && query.queryKey[4] === id) ||
            (query.queryKey[1] === 'detail' && query.queryKey[2] === id)
        ),
    })));
}
