// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/auth/registerAction";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function registerAction(...args: Parameters<typeof server.registerAction>) {
    return unwrapActionResult(await server.registerAction(...args));
}
