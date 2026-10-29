import { z } from "zod";

// POST .../permissions/{id} (201, sem corpo) e DELETE .../permissions/{id}
// (204, sem corpo) — o mesmo formato de "resposta vazia" usado em
// delete-role.
export const rolePermissionMutationResponseSchema = z.union([z.literal(""), z.null()]);
