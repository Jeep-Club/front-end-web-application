'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import {
    adminDependentsByUserResponseSchema,
    listAdminDependentsResponseSchema,
} from "@/schemas/admin/dependent";

export async function listDependentsAdminAction({
    page = 0,
    size = 10,
    q,
    name,
    cpf,
    userId,
    relationshipType,
    status,
    sort,
}: ListAdminDependentsParams = {}): Promise<ListAdminDependentsResponse> {
    size = Math.min(Math.max(size, 1), 50);

    const searchParams = new URLSearchParams();
    searchParams.set("page", String(Math.max(0, page)));
    searchParams.set("size", String(size));

    const trimmedQ = q?.trim();
    if (trimmedQ) {
        searchParams.set("q", trimmedQ);
    }

    const trimmedName = name?.trim();
    if (trimmedName) {
        searchParams.set("name", trimmedName);
    }

    const trimmedCpf = cpf?.trim();
    if (trimmedCpf) {
        searchParams.set("cpf", trimmedCpf);
    }

    if (userId !== undefined && Number.isInteger(userId) && userId > 0) {
        searchParams.set("userId", String(userId));
    }

    if (relationshipType) {
        searchParams.set("relationshipType", relationshipType);
    }

    if (status) {
        searchParams.set("status", status);
    }

    if (sort?.trim()) {
        searchParams.set("sort", sort.trim());
    }

    const response = await actionFetchWrapper<ListAdminDependentsResponse>({
        url: `${HttpAPIRoutes.ADMIN_DEPENDENTS_LIST}?${searchParams.toString()}`,
        method: "GET",
        schema: listAdminDependentsResponseSchema,
        cache: "no-store",
    });

    return response.data;
}

export async function listDependentsByUserAdminAction(userId: number): Promise<AdminDependentItem[]> {
    const response = await actionFetchWrapper<AdminDependentItem[]>({
        url: HttpAPIRoutes.ADMIN_DEPENDENTS.replace("{id}", String(userId)),
        method: "GET",
        schema: adminDependentsByUserResponseSchema,
        cache: "no-store",
    });
    return response.data;
}
