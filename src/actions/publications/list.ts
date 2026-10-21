"use server";

import { z } from "zod";
import { parsePublicationStatus, type PublicationStatusFilter } from "@/utils/publications/statusFilters";
import { parsePublicationExportIds } from "@/utils/publications/exportCsv";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { pageResponseSchema } from "@/schemas/page";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { parsePublicationPagination } from "@/utils/publications/pagination";

const imageSchema = z.object({ storageKey: z.string(), position: z.number(), primary: z.boolean() });
const statusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
const publicationSchema = z.object({ id: z.number(), title: z.string(), content: z.string(), status: statusSchema, images: z.array(imageSchema), eventStatus: z.enum(["OPEN", "IN_PROGRESS", "FINISHED", "CANCELLED"]).optional() });
const eventSchema = publicationSchema.omit({ status: true }).extend({ publicationStatus: statusSchema });
const resources = {
    NOTICE: { path: "admin/notices", action: "NOTICE_READ" },
    EVENT: { path: "admin/events", action: "EVENT_READ_ADMIN" },
    SERVICE: { path: "admin/services", action: "SERVICE_ADMIN_READ" },
} as const;
type PublicationType = keyof typeof resources;

export async function listAdminPublicationsAction(input: { types: string[]; page: number; size: number; status?: PublicationStatusFilter }) {
    const status = parsePublicationStatus(input.status);
    const types = [...new Set(input.types)].filter((type): type is PublicationType => Object.hasOwn(resources, type));
    if (!types.length) throw new Error("Selecione ao menos um tipo de publicação.");
    const permitted = await Promise.all(types.map(async (type) => await haveActionPermission("PUBLICATIONS", resources[type].action) ? type : null));
    const allowedTypes = permitted.filter((type): type is PublicationType => type !== null);
    if (!allowedTypes.length) throw new Error("Você não tem permissão para consultar estes tipos de publicação.");
    const canExport = await haveActionPermission("PUBLICATIONS", "EXPORT");
    if (!canExport && allowedTypes.some((type) => type !== "EVENT")) {
        throw new Error("A consulta administrativa de avisos e serviços pela API atual exige a permissão PUBLICATIONS_EXPORT, além da permissão de leitura do tipo.");
    }
    const { pageIndex, pageSize } = parsePublicationPagination(new URLSearchParams({ page: String(input.page), size: String(input.size) }));
    try {
        const groups = await Promise.all(allowedTypes.map(async (type) => {
            const resource = resources[type];
            if (type === "SERVICE" && status === "DRAFT") return [];
            if (type === "EVENT" && !canExport) {
                const summaries: { id: number; type: PublicationType }[] = [];
                let page = 0;
                do {
                    const result = await actionFetchWrapper({ url: `admin/events?page=${page}&size=48&sort=id,desc`, method: "GET", cache: "no-store", schema: pageResponseSchema(eventSchema) });
                    summaries.push(...result.data.content.filter((item) => status === "ALL" || item.publicationStatus === status).map((item) => ({ id: item.id, type })));
                    if (result.data.last || !result.data.content.length) break;
                    page++;
                } while (true);
                return summaries;
            }
            const params = new URLSearchParams({ format: "CSV" });
            if (status !== "ALL") params.set("status", status);
            const response = await actionFetchWrapper({ url: `${resource.path}/export?${params}`, headers: { Accept: "text/csv" }, method: "GET", cache: "no-store", schema: z.string() });
            return parsePublicationExportIds(response.data).map((id) => ({ id, type }));
        }));
        const summaries = groups.flat().sort((a, b) => b.id - a.id);
        const selected = summaries.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
        const content: (z.infer<typeof publicationSchema> & { type: PublicationType })[] = [];
        // Limita a concorrência da leitura das galerias aos itens da página visível.
        for (let offset = 0; offset < selected.length; offset += 6) {
            const batch = await Promise.all(selected.slice(offset, offset + 6).map(async ({ id, type }) => {
                if (type === "EVENT") {
                    const result = await actionFetchWrapper({ url: `${resources[type].path}/${id}`, method: "GET", cache: "no-store", schema: eventSchema });
                    return { ...result.data, type, status: result.data.publicationStatus };
                }
                const result = await actionFetchWrapper({ url: `${resources[type].path}/${id}`, method: "GET", cache: "no-store", schema: publicationSchema });
                return { ...result.data, type };
            }));
            content.push(...batch);
        }
        const totalElements = summaries.length;
        const totalPages = Math.ceil(totalElements / pageSize);
        return { content, totalElements, totalPages, number: pageIndex, size: pageSize,
            first: pageIndex === 0, last: pageIndex + 1 >= totalPages, numberOfElements: content.length, empty: content.length === 0 };
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error(extractApiErrorMessage(error, "Não foi possível carregar as publicações."), { cause: error });
    }
}