"use server";

import { z } from "zod";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { pageResponseSchema } from "@/schemas/page";

export async function listUserOptionsAction(name: string, page = 0) {
    const search = z.string().trim().max(150).parse(name);
    z.number().int().min(0).max(1000000).parse(page);
    const params = new URLSearchParams({ name: search, page: String(page), size: "20" });
    return (await actionFetchWrapper({ url: `identity/admin/users/options?${params}`, cache: "no-store", schema: pageResponseSchema(z.object({ id: z.number().int().positive(), name: z.string() })) })).data;
}
