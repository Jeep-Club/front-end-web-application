// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/medical-profile/put";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function putMedicalProfileAction(...args: Parameters<typeof server.putMedicalProfileAction>) {
    return unwrapActionResult(await server.putMedicalProfileAction(...args));
}
