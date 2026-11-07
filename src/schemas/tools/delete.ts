import { z } from "zod";

export const deleteToolResponseSchema = z.union([z.literal(""), z.null()]);