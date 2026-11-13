"use server";

import { z } from "zod";
import { birthdayUserSchema, type BirthdayUser } from "@/schemas/identity/birthdays";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

const requestSchema = z.object({ month: z.number().int().min(1).max(12) });
const birthdayUserResponseSchema = z.object({
    userId: z.number().int().positive(),
    name: z.string(),
    birthDay: z.number().int().min(1).max(31).nullable(),
    birthMonth: z.number().int().min(1).max(12).nullable(),
});
const birthdayUsersResponseSchema = z.object({
    month: z.number().int().min(1).max(12),
    birthdays: z.array(birthdayUserResponseSchema),
});

/** Maps the backend birthday DTO to the smaller shape consumed by the feed and calendar. */
function toBirthdayUser(user: z.infer<typeof birthdayUserResponseSchema>, requestedMonth: number): BirthdayUser {
    const month = user.birthMonth ?? requestedMonth;
    const day = user.birthDay;
    const validDate = day !== null && day >= 1 && day <= new Date(Date.UTC(2000, month, 0)).getUTCDate();

    return birthdayUserSchema.parse({
        id: user.userId,
        name: user.name,
        birthMonth: month,
        birthDay: validDate ? day : null,
    });
}

export async function listBirthdayUsersAction(input: { month: number }): Promise<BirthdayUser[]> {
    const { month } = requestSchema.parse(input);
    const params = new URLSearchParams({ month: String(month) });
    const response = await actionFetchWrapper({
        url: `${HttpAPIRoutes.IDENTITY_USER_BIRTHDAYS}?${params.toString()}`,
        method: "GET",
        cache: "no-store",
        schema: birthdayUsersResponseSchema,
    });

    return response.data.birthdays.map((user) => toBirthdayUser(user, month));
}
