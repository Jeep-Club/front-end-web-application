"use server";
import { publicationsRepository } from "@/mocks/admin/publications";
export async function deletePublicationAction(id: bigint): Promise<void> {
    if (id <= BigInt(0)) throw new Error("ID de publicação inválido.");
    try { await publicationsRepository.delete(id); }
    catch (error) { throw new Error(error instanceof Error ? error.message : "Não foi possível excluir a publicação.", { cause: error }); }
}
