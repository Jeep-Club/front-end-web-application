import { z } from "zod";

export const completeFirstAccessResponseSchema = z.object({
    refreshToken: z.string(),
    accessToken: z.string(),
    expiresInSeconds: z.number(),
});
