"use server";

import { z } from "zod";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { ActionError } from "@/utils/http/ActionError";
import { getDownloadFilename } from "@/utils/http/contentDisposition";
import { buildAdminTablePdfFile, decodeAdminCsv, parseAdminCsv } from "@/utils/admin-export/usersPdf";
import { getAdminPdfIdentity } from "@/server/utils/adminExportPdf";

const exportTarget = z.object({
    type: z.enum(["NOTICE", "EVENT", "SERVICE"]),
    status: z.enum(["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"]),
    format: z.enum(["CSV", "PDF"]).default("CSV"),
});
const resource = {
    NOTICE: { path: "admin/notices", read: "NOTICE_READ" },
    EVENT: { path: "admin/events", read: "EVENT_READ_ADMIN" },
    SERVICE: { path: "admin/services", read: "SERVICE_ADMIN_READ" },
} as const;

/** Downloads the API's native CSV export; it never assembles a report from paginated list data. */
export async function exportAdminPublicationsAction(input: z.input<typeof exportTarget>) {
    const { type, status, format } = exportTarget.parse(input);
    if (!await haveActionPermission("PUBLICATIONS", "EXPORT") || !await haveActionPermission("PUBLICATIONS", resource[type].read)) {
        throw new ActionError("Você não tem permissão para exportar esta publicação.");
    }
    const query = new URLSearchParams({ format: "CSV" });
    if (status !== "ALL") query.set("status", status);
    const response = await actionFetchWrapper({
        url: `${resource[type].path}/export?${query}`,
        method: "GET",
        cache: "no-store",
        responseType: "blob",
        allowedContentTypes: ["text/csv"],
        schema: z.instanceof(Blob),
        headers: { Accept: "text/csv" },
    });
    const file = {
        base64: Buffer.from(await response.data.arrayBuffer()).toString("base64"),
        contentType: response.data.type || "text/csv;charset=UTF-8",
        filename: getDownloadFilename(response.contentDisposition, `${type.toLowerCase()}-${status.toLowerCase()}.csv`),
    };
    if (format === "CSV") return file;

    const identity = await getAdminPdfIdentity();
    const title = { NOTICE: "Avisos", EVENT: "Eventos", SERVICE: "Serviços" }[type];
    return buildAdminTablePdfFile(parseAdminCsv(decodeAdminCsv(file.base64)), {
        title: `Relatório de ${title.toLocaleLowerCase("pt-BR")}`,
        recordLabel: "publicação(ões)",
        filename: file.filename,
        exportedBy: identity.exportedBy,
        filters: [`Tipo: ${title}`, `Situação: ${status === "ALL" ? "Todas" : status}`],
        seal: identity.seal,
    });
}
