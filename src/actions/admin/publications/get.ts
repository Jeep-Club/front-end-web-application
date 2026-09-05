"use server";
import { publicationsRepository } from "@/mocks/admin/publications";
export async function getPublicationAction(id: bigint): Promise<Publication> {
    if (id <= BigInt(0)) throw new Error("ID de publicação inválido.");
    try { return await publicationsRepository.get(id); }
    catch (error) { throw new Error(error instanceof Error ? error.message : "Não foi possível carregar a publicação.", { cause: error }); }
}
