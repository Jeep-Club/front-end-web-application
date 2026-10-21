// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/profile/update-personal-data";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function updatePersonalDataAction(...args: Parameters<typeof server.updatePersonalDataAction>) {
    return unwrapActionResult(await server.updatePersonalDataAction(...args));
}
