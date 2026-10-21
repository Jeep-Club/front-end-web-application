// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/tools/detail";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function getToolDetailAction(...args: Parameters<typeof server.getToolDetailAction>) {
    return unwrapActionResult(await server.getToolDetailAction(...args));
}
