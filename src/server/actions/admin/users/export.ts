"use server";

import { z } from "zod";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { ActionError } from "@/utils/http/ActionError";
import { getDownloadFilename } from "@/utils/http/contentDisposition";
import { buildAdminUsersPdfFile } from "@/utils/admin-export/usersPdf";
import { getAdminPdfIdentity } from "@/server/utils/adminExportPdf";

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

async function requireUserExportPermission() {
    if (!(await haveActionPermission("IDENTITY", "USER_EXPORT"))) throw new ActionError("Acesso não permitido.");
}

function buildUserExportParams(searchParams: AdminUserSearchParams, format: "CSV" | "PDF", layout: "MEMBER" | "TECHNICAL") {
    const params = new URLSearchParams({ format, layout });
    for (const key of FILTER_KEYS) {
        const value = searchParams[key];
        if (!value || typeof value !== "string") continue;
        if (key === "status" && value === "ALL") continue;
        params.set(key, value);
    }
    return params;
}

async function requestUserExport(searchParams: AdminUserSearchParams, format: "CSV" | "PDF", layout: "MEMBER" | "TECHNICAL" = "MEMBER") {
    const params = buildUserExportParams(searchParams, format, layout);
    const contentType = format === "CSV" ? "text/csv" : "application/pdf";
    const response = await actionFetchWrapper({
        url: `${HttpAPIRoutes.ADMIN_USERS}/export?${params.toString()}`,
        method: "GET",
        schema: z.instanceof(Blob),
        responseType: "blob",
        allowedContentTypes: [contentType],
        cache: "no-store",
        headers: { Accept: contentType },
    });
    const blob = response.data;
    return {
        base64: Buffer.from(await blob.arrayBuffer()).toString("base64"),
        contentType: blob.type || contentType,
        filename: getDownloadFilename(response.contentDisposition, `usuarios-${layout.toLowerCase()}.${format.toLowerCase()}`),
    };
}

export async function exportAdminUsersAction(
    searchParams: AdminUserSearchParams,
    format: "CSV" | "PDF",
    layout: "MEMBER" | "TECHNICAL" = "MEMBER",
) {
    await requireUserExportPermission();
    z.enum(["CSV", "PDF"]).parse(format);
    z.enum(["MEMBER", "TECHNICAL"]).parse(layout);
    return requestUserExport(searchParams, format, layout);
}

/** Uses the existing CSV export to build a branded PDF without sending raw rows to the browser. */
export async function exportAdminUsersReportPdfAction(searchParams: AdminUserSearchParams) {
    await requireUserExportPermission();
    const [source, identity] = await Promise.all([
        requestUserExport(searchParams, "CSV", "MEMBER"),
        getAdminPdfIdentity(),
    ]);
    return buildAdminUsersPdfFile(source, searchParams, identity.exportedBy, identity.seal);
}
