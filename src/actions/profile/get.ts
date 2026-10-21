// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/profile/get";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function getUserProfileAction(...args: Parameters<typeof server.getUserProfileAction>) {
    return unwrapActionResult(await server.getUserProfileAction(...args));
}
