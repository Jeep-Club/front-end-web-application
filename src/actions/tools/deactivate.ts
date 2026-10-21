// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/tools/deactivate";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function deactivateToolAction(...args: Parameters<typeof server.deactivateToolAction>) {
    return unwrapActionResult(await server.deactivateToolAction(...args));
}
