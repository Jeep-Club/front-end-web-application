import { z } from "zod";

export const deleteRoleResponseSchema = z.union([z.literal(""), z.null()]);
