"use server";

import { z } from "zod";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { pageResponseSchema } from "@/schemas/page";
import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";
import { extractApiErrorMessage } from "@/utils/http/apiError";

export async function listUserOptionsAction(name: string, page = 0) {
    return captureAction(async () => {
        const search = z.string().trim().max(150).parse(name);
        z.number().int().min(0).max(1000000).parse(page);
        const params = new URLSearchParams({ name: search, page: String(page), size: "20" });
        try {
            return (await actionFetchWrapper({ url: `identity/admin/users/options?${params}`, cache: "no-store", schema: pageResponseSchema(z.object({ id: z.number().int().positive(), name: z.string() })) })).data;
        } catch (error) {
            throw new ActionError(extractApiErrorMessage(error, "Não foi possível pesquisar os associados."), { cause: error });
        }
    });
}
