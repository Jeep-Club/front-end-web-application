'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { z } from "zod";

export async function deleteDependentAdminAction(userId: number, id: number): Promise<void> {
    z.number().int().positive().parse(userId);
    z.number().int().positive().parse(id);
    await actionFetchWrapper({
        url: `${HttpAPIRoutes.ADMIN_DEPENDENTS.replace("{id}", String(userId))}/${id}`,
        method: "DELETE",
        schema: z.union([z.literal(""), z.null(), z.undefined()]),
    });
}
