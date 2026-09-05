"use server";
import { publicationsRepository } from "@/mocks/admin/publications";
import { toPublicationListQuery } from "@/utils/searchParam/admin/publication";
export async function listPublicationsAction(searchParams: PublicationSearchParams): Promise<PageResponse<Publication>> {
    try { return await publicationsRepository.list(toPublicationListQuery(searchParams)); }
    catch (error) { throw new Error("Não foi possível carregar as publicações.", { cause: error }); }
}
