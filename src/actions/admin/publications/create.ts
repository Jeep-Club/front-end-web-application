"use server";
import { publicationsRepository } from "@/mocks/admin/publications";
import { createPublicationSchema } from "@/schemas/admin/publication";
export async function createPublicationAction(input: CreatePublicationInput): Promise<Publication> {
    try { return await publicationsRepository.create(createPublicationSchema.parse(input) as CreatePublicationInput); }
    catch (error) { throw new Error("Não foi possível criar a publicação. Verifique os dados informados.", { cause: error }); }
}
