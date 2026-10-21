// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/dependents/index";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function listDependentsAction(...args: Parameters<typeof server.listDependentsAction>) {
    return unwrapActionResult(await server.listDependentsAction(...args));
}

export async function createDependentAction(...args: Parameters<typeof server.createDependentAction>) {
    return unwrapActionResult(await server.createDependentAction(...args));
}

export async function getDependentMedicalProfileAction(...args: Parameters<typeof server.getDependentMedicalProfileAction>) {
    return unwrapActionResult(await server.getDependentMedicalProfileAction(...args));
}

export async function saveDependentMedicalProfileAction(...args: Parameters<typeof server.saveDependentMedicalProfileAction>) {
    return unwrapActionResult(await server.saveDependentMedicalProfileAction(...args));
}

export async function updateDependentAction(...args: Parameters<typeof server.updateDependentAction>) {
    return unwrapActionResult(await server.updateDependentAction(...args));
}

export async function deleteDependentAction(...args: Parameters<typeof server.deleteDependentAction>) {
    return unwrapActionResult(await server.deleteDependentAction(...args));
}
