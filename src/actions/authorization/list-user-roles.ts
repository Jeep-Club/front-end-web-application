// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/authorization/list-user-roles";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function listUserRolesAction(...args: Parameters<typeof server.listUserRolesAction>) {
    return unwrapActionResult(await server.listUserRolesAction(...args));
}
