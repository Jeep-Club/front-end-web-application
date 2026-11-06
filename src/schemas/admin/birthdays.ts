import { z } from "zod";

export const birthdayUserSchema = z.object({
    id: z.number().int().positive(),
    name: z.string(),
    birthMonth: z.number().int().min(1).max(12).nullable(),
    birthDay: z.number().int().min(1).max(31).nullable(),
});

export type BirthdayUser = z.infer<typeof birthdayUserSchema>;
