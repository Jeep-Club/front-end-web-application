// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/authorization/list-roles";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function listRolesAction(...args: Parameters<typeof server.listRolesAction>) {
    return unwrapActionResult(await server.listRolesAction(...args));
}
