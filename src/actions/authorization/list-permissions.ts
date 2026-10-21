// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/authorization/list-permissions";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function listPermissionsAction(...args: Parameters<typeof server.listPermissionsAction>) {
    return unwrapActionResult(await server.listPermissionsAction(...args));
}
