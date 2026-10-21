// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/tools/update";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function updateToolAction(...args: Parameters<typeof server.updateToolAction>) {
    return unwrapActionResult(await server.updateToolAction(...args));
}
