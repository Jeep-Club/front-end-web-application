// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/auth/refresh";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function refreshAction(...args: Parameters<typeof server.refreshAction>) {
    return unwrapActionResult(await server.refreshAction(...args));
}
