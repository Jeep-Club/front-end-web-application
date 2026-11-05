"use server";

import { z } from "zod";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { ActionError } from "@/utils/http/ActionError";

const FILTER_KEYS: (keyof AdminUserSearchParams)[] = [
    "id",
    "name",
    "birthDate",
    "cpf",
    "rg",
    "email",
    "phoneNumber",
    "membershipNumber",
    "status",
    "createdFrom",
    "createdTo",
    "updatedFrom",
    "updatedTo",
    "q",
];

export async function exportAdminUsersAction(
    searchParams: AdminUserSearchParams,
    format: "CSV" | "PDF",
    layout: "MEMBER" | "TECHNICAL" = "MEMBER",
) {
    if (!(await haveActionPermission("IDENTITY", "USER_EXPORT"))) {
        throw new ActionError("Acesso não permitido.");
    }

    z.enum(["CSV", "PDF"]).parse(format);
    z.enum(["MEMBER", "TECHNICAL"]).parse(layout);

    const params = new URLSearchParams({ format, layout });
    for (const key of FILTER_KEYS) {
        const value = searchParams[key];
        if (!value || typeof value !== "string") continue;
        if (key === "status" && value === "ALL") continue;
        params.set(key, value);
    }

    const contentType = format === "CSV" ? "text/csv" : "application/pdf";
    const blob = (
        await actionFetchWrapper({
            url: `${HttpAPIRoutes.ADMIN_USERS}/export?${params.toString()}`,
            method: "GET",
            schema: z.instanceof(Blob),
            responseType: "blob",
            allowedContentTypes: [contentType],
            cache: "no-store",
            headers: { Accept: contentType },
        })
    ).data;

    return {
        base64: Buffer.from(await blob.arrayBuffer()).toString("base64"),
        contentType: blob.type || contentType,
        filename: `usuarios-${layout.toLowerCase()}.${format.toLowerCase()}`,
    };
}
