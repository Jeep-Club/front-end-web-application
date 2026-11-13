'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { adminDependentItemSchema } from "@/schemas/admin/dependent";
import { z } from "zod";

export async function getDependentDetailAdminAction(
    id: number,
    userId?: number,
): Promise<AdminDependentItem> {
    z.number().int().positive().parse(id);
    if (userId !== undefined) {
        z.number().int().positive().parse(userId);
        const response = await actionFetchWrapper<AdminDependentItem>({
            url: `${HttpAPIRoutes.ADMIN_DEPENDENTS.replace("{id}", String(userId))}/${id}`,
            method: "GET",
            schema: adminDependentItemSchema,
            cache: "no-store",
        });
        return response.data;
    }

    const response = await actionFetchWrapper<AdminDependentItem>({
        url: `${HttpAPIRoutes.ADMIN_DEPENDENTS_LIST}/${id}`,
        method: "GET",
        schema: adminDependentItemSchema,
        cache: "no-store",
    });
    return response.data;
}
