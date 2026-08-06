import { z } from "zod";
import { roleResponseSchema } from "./detail";

export const roleListResponseSchema: z.ZodType<RoleListResponse> = z.array(roleResponseSchema);
