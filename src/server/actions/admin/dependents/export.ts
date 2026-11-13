'use server';

import { z } from "zod";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { ActionError } from "@/utils/http/ActionError";
import { HttpAPIRoutes } from "@/utils/http/api";
import { getDownloadFilename } from "@/utils/http/contentDisposition";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import {
    buildAdminTablePdfFile,
    decodeAdminCsv,
    parseAdminCsv,
} from "@/utils/admin-export/usersPdf";
import { getAdminPdfIdentity } from "@/server/utils/adminExportPdf";

export interface ExportAdminDependentsInput {
    format: "CSV" | "PDF";
    history?: boolean;
    id?: number;
    userId?: number;
    name?: string;
    status?: AdminDependentStatus;
}

export async function exportAdminDependentsAction({
    format,
    history = false,
    id,
    userId,
    name,
    status,
}: ExportAdminDependentsInput) {
    if (!(await haveActionPermission("DEPENDENTS", "DEPENDENT_EXPORT"))) {
        throw new ActionError("Acesso não permitido para exportar dependentes.");
    }

    z.enum(["CSV", "PDF"]).parse(format);

    const params = new URLSearchParams({ format: "CSV" });
    if (!history) {
        if (id !== undefined) {
            params.set("id", String(z.number().int().positive().parse(id)));
        }
        if (userId !== undefined) {
            params.set("userId", String(z.number().int().positive().parse(userId)));
        }
        const trimmedName = name?.trim();
        if (trimmedName) {
            params.set("name", trimmedName);
        }
        if (status) {
            params.set("status", status);
        }
    }

    const endpoint = history
        ? HttpAPIRoutes.ADMIN_DEPENDENTS_HISTORY_EXPORT
        : HttpAPIRoutes.ADMIN_DEPENDENTS_EXPORT;

    const response = await actionFetchWrapper({
        url: `${endpoint}?${params.toString()}`,
        method: "GET",
        schema: z.instanceof(Blob),
        responseType: "blob",
        allowedContentTypes: ["text/csv"],
        cache: "no-store",
        headers: { Accept: "text/csv" },
    });

    const blob = response.data;
    const defaultFilename = `dependentes${history ? "-historico" : ""}.csv`;
    const file = {
        base64: Buffer.from(await blob.arrayBuffer()).toString("base64"),
        contentType: blob.type || "text/csv;charset=UTF-8",
        filename: getDownloadFilename(response.contentDisposition, defaultFilename),
    };

    if (format === "CSV") {
        return file;
    }

    const identity = await getAdminPdfIdentity();
    const filterNotes: string[] = [];
    if (history) {
        filterNotes.push("Inclui histórico de exclusões");
    } else {
        if (id !== undefined) filterNotes.push(`Dependente ID: ${id}`);
        if (userId !== undefined) filterNotes.push(`Titular ID: ${userId}`);
        if (name?.trim()) filterNotes.push(`Nome: ${name.trim()}`);
        if (status) filterNotes.push(`Status: ${status}`);
    }

    return buildAdminTablePdfFile(parseAdminCsv(decodeAdminCsv(file.base64)), {
        title: history
            ? "Histórico de dependentes excluídos"
            : "Relatório administrativo de dependentes",
        recordLabel: history
            ? "registro(s) de histórico"
            : "dependente(s)",
        filename: file.filename,
        exportedBy: identity.exportedBy,
        filters: filterNotes,
        seal: identity.seal,
    });
}
