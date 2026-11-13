'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { adminDependentItemSchema } from "@/schemas/admin/dependent";
import { z } from "zod";

function validateIds(userId: number, id: number) {
    z.number().int().positive().parse(userId);
    z.number().int().positive().parse(id);
}

export async function enableDependentAdminAction(userId: number, id: number): Promise<AdminDependentItem> {
    validateIds(userId, id);
    const response = await actionFetchWrapper<AdminDependentItem>({
        url: `${HttpAPIRoutes.ADMIN_DEPENDENTS.replace("{id}", String(userId))}/${id}/enable`,
        method: "PATCH",
        schema: adminDependentItemSchema,
    });
    return response.data;
}

export async function disableDependentAdminAction(userId: number, id: number): Promise<AdminDependentItem> {
    validateIds(userId, id);
    const response = await actionFetchWrapper<AdminDependentItem>({
        url: `${HttpAPIRoutes.ADMIN_DEPENDENTS.replace("{id}", String(userId))}/${id}/disable`,
        method: "PATCH",
        schema: adminDependentItemSchema,
    });
    return response.data;
}

export async function archiveDependentAdminAction(userId: number, id: number): Promise<AdminDependentItem> {
    validateIds(userId, id);
    const response = await actionFetchWrapper<AdminDependentItem>({
        url: `${HttpAPIRoutes.ADMIN_DEPENDENTS.replace("{id}", String(userId))}/${id}/archive`,
        method: "PATCH",
        schema: adminDependentItemSchema,
    });
    return response.data;
}

export async function unarchiveDependentAdminAction(userId: number, id: number): Promise<AdminDependentItem> {
    validateIds(userId, id);
    const response = await actionFetchWrapper<AdminDependentItem>({
        url: `${HttpAPIRoutes.ADMIN_DEPENDENTS.replace("{id}", String(userId))}/${id}/unarchive`,
        method: "PATCH",
        schema: adminDependentItemSchema,
    });
    return response.data;
}
