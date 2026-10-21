// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/tools/activate";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function activateToolAction(...args: Parameters<typeof server.activateToolAction>) {
    return unwrapActionResult(await server.activateToolAction(...args));
}
