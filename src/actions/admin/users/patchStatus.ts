// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/users/patchStatus";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function patchUserStatusAction(...args: Parameters<typeof server.patchUserStatusAction>) {
    return unwrapActionResult(await server.patchUserStatusAction(...args));
}
