// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/tools/delete";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function deleteToolAction(...args: Parameters<typeof server.deleteToolAction>) {
    return unwrapActionResult(await server.deleteToolAction(...args));
}
