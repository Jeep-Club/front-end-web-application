// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/auth/me";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function meAction(...args: Parameters<typeof server.meAction>) {
    return unwrapActionResult(await server.meAction(...args));
}
