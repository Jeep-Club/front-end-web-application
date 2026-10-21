// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/profile/medical-profile";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function getMedicalProfileAction(...args: Parameters<typeof server.getMedicalProfileAction>) {
    return unwrapActionResult(await server.getMedicalProfileAction(...args));
}

export async function saveMedicalProfileAction(...args: Parameters<typeof server.saveMedicalProfileAction>) {
    return unwrapActionResult(await server.saveMedicalProfileAction(...args));
}
