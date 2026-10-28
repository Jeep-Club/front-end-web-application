"use server";

import { z } from "zod";
import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { medicalPermissions } from "@/config/medicalPermissions";
import { getAllMedicalProfilesResponseSchema, getMedicalProfileResponseSchema } from "@/schemas/admin/medical-profile";

const base = "admin/medical-profiles";
async function allowed(action: string) {
    if (!await haveActionPermission(medicalPermissions.module, action)) throw new ActionError("Acesso não permitido.");
}
async function run<T>(operation: () => Promise<T>) {
    try { return await operation(); }
    catch (error) { throw new ActionError(extractApiErrorMessage(error, "Não foi possível concluir a operação nos dados médicos."), { cause: error }); }
}
export async function listMedicalProfilesAction(page = 0, size = 10) {
    return captureAction(() => run(async () => {
        await allowed(medicalPermissions.read);
        z.number().int().nonnegative().parse(page);
        z.number().int().min(1).max(50).parse(size);
        return (await actionFetchWrapper({ url: `${base}?page=${page}&size=${size}&sort=id,desc`, schema: getAllMedicalProfilesResponseSchema, cache: "no-store" })).data;
    }));
}
export async function getMedicalProfileAdminAction(id: number) {
    return captureAction(() => run(async () => {
        await allowed(medicalPermissions.read);
        z.number().int().positive().parse(id);
        return (await actionFetchWrapper({ url: `${base}/${id}`, schema: getMedicalProfileResponseSchema, cache: "no-store" })).data;
    }));
}
export async function deleteMedicalProfileAction(id: number) {
    return captureAction(() => run(async () => {
        await allowed(medicalPermissions.delete);
        z.number().int().positive().parse(id);
        await actionFetchWrapper({ url: `${base}/${id}`, method: "DELETE", schema: z.unknown(), cache: "no-store" });
        return true;
    }));
}
export async function getMedicalOwnerAction(id: number) {
    return captureAction(() => run(async () => {
        await allowed(medicalPermissions.read);
        z.number().int().positive().parse(id);
        return (await actionFetchWrapper({ url: `${base}/${id}/owner`, schema: z.object({ name: z.string().nullable(), responsibleName: z.string().nullable() }), cache: "no-store" })).data;
    }));
}
export async function exportMedicalProfilesAction(format: "CSV" | "PDF", profileId?: number, history = false) {
    return captureAction(() => run(async () => {
        await allowed(medicalPermissions.export);
        z.enum(["CSV", "PDF"]).parse(format);
        const params = new URLSearchParams({ format });
        if (profileId !== undefined) params.set("profileId", String(z.number().int().positive().parse(profileId)));
        const blob = (await actionFetchWrapper({ url: `${base}/${history ? "history/" : ""}export?${params}`, schema: z.instanceof(Blob), responseType: "blob", cache: "no-store", headers: { Accept: format === "CSV" ? "text/csv" : "application/pdf" } })).data;
        return { base64: Buffer.from(await blob.arrayBuffer()).toString("base64"), contentType: blob.type, filename: `dados-medicos${history ? "-historico" : ""}${profileId ? `-${profileId}` : ""}.${format.toLowerCase()}` };
    }));
}
