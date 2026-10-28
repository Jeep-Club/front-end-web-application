"use server";
import * as server from "@/server/actions/admin/medical-profile/manage";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function listMedicalProfilesAction(...args: Parameters<typeof server.listMedicalProfilesAction>) { return unwrapActionResult(await server.listMedicalProfilesAction(...args)); }
export async function getMedicalOwnerAction(...args: Parameters<typeof server.getMedicalOwnerAction>) { return unwrapActionResult(await server.getMedicalOwnerAction(...args)); }
export async function getMedicalProfileAdminAction(...args: Parameters<typeof server.getMedicalProfileAdminAction>) { return unwrapActionResult(await server.getMedicalProfileAdminAction(...args)); }
export async function deleteMedicalProfileAction(...args: Parameters<typeof server.deleteMedicalProfileAction>) { return unwrapActionResult(await server.deleteMedicalProfileAction(...args)); }
export async function exportMedicalProfilesAction(...args: Parameters<typeof server.exportMedicalProfilesAction>) { return unwrapActionResult(await server.exportMedicalProfilesAction(...args)); }
