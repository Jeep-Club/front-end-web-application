"use server";

import { z } from "zod";
import { ActionError } from "@/utils/http/ActionError";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { medicalPermissions } from "@/config/medicalPermissions";
import { getAllMedicalProfilesResponseSchema, getMedicalProfileResponseSchema } from "@/schemas/admin/medical-profile";

const base = "admin/medical-profiles";
async function allowed(action: string) {
    if (!await haveActionPermission(medicalPermissions.module, action)) throw new ActionError("Acesso não permitido.");
}
export async function listMedicalProfilesAction(page = 0, size = 10) {
    await allowed(medicalPermissions.read);
    z.number().int().nonnegative().parse(page);
    z.number().int().min(1).max(50).parse(size);
    return (await actionFetchWrapper({ url: `${base}?page=${page}&size=${size}&sort=id,desc`, schema: getAllMedicalProfilesResponseSchema, cache: "no-store" })).data;
}
export async function getMedicalProfileAdminAction(id: number) {
    await allowed(medicalPermissions.read);
    z.number().int().positive().parse(id);
    return (await actionFetchWrapper({ url: `${base}/${id}`, schema: getMedicalProfileResponseSchema, cache: "no-store" })).data;
}
export async function deleteMedicalProfileAction(id: number) {
    await allowed(medicalPermissions.delete);
    z.number().int().positive().parse(id);
    await actionFetchWrapper({ url: `${base}/${id}`, method: "DELETE", schema: z.unknown(), cache: "no-store" });
    return true;
}
export async function getMedicalOwnerAction(id: number) {
    await allowed(medicalPermissions.read);
    z.number().int().positive().parse(id);
    return (await actionFetchWrapper({ url: `${base}/${id}/owner`, schema: z.object({ name: z.string().nullable(), responsibleName: z.string().nullable() }), cache: "no-store" })).data;
}
export async function exportMedicalProfilesAction(format: "CSV" | "PDF", profileId?: number, history = false) {
    await allowed(medicalPermissions.export);
    z.enum(["CSV", "PDF"]).parse(format);
    const params = new URLSearchParams({ format });
    if (profileId !== undefined) params.set("profileId", String(z.number().int().positive().parse(profileId)));
    const blob = (await actionFetchWrapper({ url: `${base}/${history ? "history/" : ""}export?${params}`, schema: z.instanceof(Blob), responseType: "blob", allowedContentTypes: [format === "CSV" ? "text/csv" : "application/pdf"], cache: "no-store", headers: { Accept: format === "CSV" ? "text/csv" : "application/pdf" } })).data;
    return { base64: Buffer.from(await blob.arrayBuffer()).toString("base64"), contentType: blob.type, filename: `dados-medicos${history ? "-historico" : ""}${profileId ? `-${profileId}` : ""}.${format.toLowerCase()}` };
}
