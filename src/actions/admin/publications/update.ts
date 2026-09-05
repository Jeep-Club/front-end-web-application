"use server";
import { publicationsRepository } from "@/mocks/admin/publications";
import { updatePublicationSchema } from "@/schemas/admin/publication";
export async function updatePublicationAction(id: bigint, input: UpdatePublicationInput): Promise<Publication> {
    if (id <= BigInt(0)) throw new Error("ID de publicação inválido.");
    try { return await publicationsRepository.update(id, updatePublicationSchema.parse(input) as UpdatePublicationInput); }
    catch (error) { throw new Error(error instanceof Error ? error.message : "Não foi possível atualizar a publicação.", { cause: error }); }
}
