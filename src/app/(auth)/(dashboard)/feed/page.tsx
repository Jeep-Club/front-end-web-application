import Feed from "@/components/pages/feed";
import serverCallApi from "@/services/fetchWrapper/serverFetchWrapper";
import { pageResponseSchema } from "@/schemas/page";
import { publicationFeedItemSchema } from "@/schemas/publications/feed";
import { parsePublicationFeedFilters } from "@/utils/publications/feedFilters";
import { getActionFailure } from "@/utils/http/ActionError";
import type { ActionFailure } from "@/utils/http/ActionError";
import type { PublicationFeedItem } from "@/schemas/publications/feed";

export default async function FeedPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    const raw = await searchParams;
    const query = new URLSearchParams();
    for (const [key, values] of Object.entries(raw)) {
        for (const value of Array.isArray(values) ? values : values ? [values] : []) query.append(key, value);
    }
    const filters = parsePublicationFeedFilters(query);
    const pageValue = query.get('page') ?? '0';
    const page = /^\d+$/.test(pageValue) && Number.isSafeInteger(Number(pageValue)) ? Number(pageValue) : 0;
    if (!filters.success) return <Feed page={page} />;
    const apiQuery = new URLSearchParams({ page: String(page), size: '12', ...filters.data });
    let data: PageResponse<PublicationFeedItem> | undefined;
    let failure: ActionFailure | undefined;
    try {
        data = (await serverCallApi({ url: `publications/feed?${apiQuery}`, method: 'GET', cache: 'no-store', schema: pageResponseSchema(publicationFeedItemSchema) })).data;
    } catch (error) {
        failure = getActionFailure(error) ?? { message: 'Não foi possível carregar as publicações.' };
    }
    return <Feed data={data} page={page} error={failure} />;
}
