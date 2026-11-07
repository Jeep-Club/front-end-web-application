import { z } from "zod";
import { draftEditorialSchema } from "./draft";

const id = z.number().int().positive();
export const publishedMutationSchema = z.discriminatedUnion("action", [
    z.object({ id, type: z.enum(["NOTICE", "EVENT"]), action: z.literal("edit"), ...draftEditorialSchema.shape }),
    z.object({ id, type: z.literal("NOTICE"), action: z.literal("archive") }),
    z.object({ id, type: z.literal("EVENT"), action: z.literal("cancel") }),
    z.object({ id, type: z.literal("EVENT"), action: z.literal("finish") }),
    z.object({ id, type: z.enum(["NOTICE", "EVENT", "SERVICE"]), action: z.literal("delete") }),
]);
export type PublishedMutation = z.infer<typeof publishedMutationSchema>;