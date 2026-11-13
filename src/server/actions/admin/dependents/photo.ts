'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { adminDependentItemSchema } from "@/schemas/admin/dependent";
import { ActionError } from "@/utils/http/ActionError";
import { z } from "zod";

export async function replaceDependentPhotoAdminAction(
    userId: number,
    id: number,
    form: FormData,
): Promise<AdminDependentItem> {
    z.number().int().positive().parse(userId);
    z.number().int().positive().parse(id);
    const photo = form.get("photo");
    if (!(photo instanceof File) || !photo.size) {
        throw new ActionError("Selecione uma foto para o dependente.");
    }
    if (photo.size > 5 * 1024 * 1024) {
        throw new ActionError("A foto deve ter no máximo 5 MiB.");
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
        throw new ActionError("Use uma foto JPEG, PNG ou WebP.");
    }
    const body = new FormData();
    body.set("photo", photo, photo.name);
    const response = await actionFetchWrapper<AdminDependentItem>({
        url: `${HttpAPIRoutes.ADMIN_DEPENDENTS.replace("{id}", String(userId))}/${id}/photo`,
        method: "PATCH",
        body,
        schema: adminDependentItemSchema,
    });
    return response.data;
}

export async function removeDependentPhotoAdminAction(
    userId: number,
    id: number,
): Promise<AdminDependentItem> {
    z.number().int().positive().parse(userId);
    z.number().int().positive().parse(id);
    const response = await actionFetchWrapper<AdminDependentItem>({
        url: `${HttpAPIRoutes.ADMIN_DEPENDENTS.replace("{id}", String(userId))}/${id}/photo`,
        method: "DELETE",
        schema: adminDependentItemSchema,
    });
    return response.data;
}
