// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/authorization/get-role";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function getRoleAction(...args: Parameters<typeof server.getRoleAction>) {
    return unwrapActionResult(await server.getRoleAction(...args));
}
