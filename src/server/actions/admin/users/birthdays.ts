"use server";

import { z } from "zod";
import { pageResponseSchema } from "@/schemas/page";
import { birthdayUserSchema } from "@/schemas/admin/birthdays";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

const requestSchema = z.object({
    page: z.number().int().min(0).max(1_000_000),
    size: z.number().int().min(1).max(50),
});

// A API envia a data completa, mas só mês e dia atravessam esta Server Action.
const birthdayUserResponseSchema = z.object({
    id: z.number().int().positive(),
    name: z.string(),
    birth_date: z.string().nullish(),
    birthDate: z.string().nullish(),
}).transform(({ id, name, birth_date, birthDate }) => {
    const value = birth_date ?? birthDate;
    const match = value?.match(/^\d{4}-(\d{2})-(\d{2})/);
    const month = match ? Number(match[1]) : null;
    const day = match ? Number(match[2]) : null;
    const validDate = month !== null && day !== null
        && month >= 1 && month <= 12
        && day >= 1 && day <= new Date(Date.UTC(2000, month, 0)).getUTCDate();

    return {
        id,
        name,
        birthMonth: validDate ? month : null,
        birthDay: validDate ? day : null,
    };
}).pipe(birthdayUserSchema);

const birthdayUsersResponseSchema = pageResponseSchema(birthdayUserResponseSchema);

export async function listBirthdayUsersAction(input: { page: number; size: number }) {
    const { page, size } = requestSchema.parse(input);
    const params = new URLSearchParams({
        fields: "ID,NAME,BIRTH_DATE",
        status: "ACTIVE",
        page: String(page),
        size: String(size),
    });

    const response = await actionFetchWrapper({
        url: `${HttpAPIRoutes.ADMIN_USERS}?${params.toString()}`,
        method: "GET",
        cache: "no-store",
        schema: birthdayUsersResponseSchema,
    });

    return response.data;
}
