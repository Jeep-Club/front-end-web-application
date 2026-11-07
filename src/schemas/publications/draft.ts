import { z } from "zod";
import { publicationPlainText } from "@/utils/publications/content";

export const draftEditorialSchema = z.object({
    title: z.string().trim().min(1, "Informe o título.").max(200, "Use até 200 caracteres."),
    content: z.string().trim().refine((value) => publicationPlainText(value).length > 0, "Escreva o conteúdo da publicação."),
});
export type DraftEditorialData = z.infer<typeof draftEditorialSchema>;
const target = { id: z.number().int().positive(), type: z.enum(["NOTICE", "EVENT"]) };
export const draftMutationSchema = z.discriminatedUnion("action", [
    z.object({ ...target, action: z.literal("edit"), ...draftEditorialSchema.shape }),
    z.object({ ...target, action: z.literal("publish") }),
    z.object({ ...target, action: z.literal("delete") }),
]);
export type DraftMutation = z.infer<typeof draftMutationSchema>;