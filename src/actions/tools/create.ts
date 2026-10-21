// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/tools/create";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function createToolAction(...args: Parameters<typeof server.createToolAction>) {
    return unwrapActionResult(await server.createToolAction(...args));
}
