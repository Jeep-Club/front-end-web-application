import { publicationFilterSchema } from "@/schemas/admin/publication";

const SORT_FIELDS = new Set(["title", "type", "status", "publishedAt", "createdAt", "updatedAt", "startAt", "expiresAt"]);

export function parsePublicationSearchParams(raw: PublicationSearchParams): PublicationSearchParams {
    const parsed = publicationFilterSchema.safeParse(raw);
    const value = parsed.success ? parsed.data : publicationFilterSchema.parse({});
    const [field, direction] = value.sort?.split(",") ?? [];
    const sort = SORT_FIELDS.has(field) && (direction === "asc" || direction === "desc") ? `${field},${direction}` : undefined;
    return {
        ...(value.q && { q: value.q }), ...(value.title && { title: value.title }), ...(value.type && { type: value.type }),
        ...(value.status && { status: value.status }), ...(value.noticePriority && { noticePriority: value.noticePriority }),
        ...(value.serviceCategory && { serviceCategory: value.serviceCategory }), ...(value.createdFrom && { createdFrom: value.createdFrom }),
        ...(value.createdTo && { createdTo: value.createdTo }), ...(value.publishedFrom && { publishedFrom: value.publishedFrom }),
        ...(value.publishedTo && { publishedTo: value.publishedTo }), page: String(value.page), size: String(value.size), ...(sort && { sort }),
    };
}

export function toPublicationListQuery(params: PublicationSearchParams): PublicationListQuery {
    const valid = parsePublicationSearchParams(params);
    return { ...valid, page: Number(valid.page), size: Number(valid.size) };
}
