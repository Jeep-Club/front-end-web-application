// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/authorization/create-role";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function createRoleAction(...args: Parameters<typeof server.createRoleAction>) {
    return unwrapActionResult(await server.createRoleAction(...args));
}
