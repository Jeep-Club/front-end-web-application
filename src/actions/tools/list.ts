import * as server from "@/server/actions/tools/list";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function listToolsAction(...args: Parameters<typeof server.listToolsAction>) {
    return unwrapActionResult(await server.listToolsAction(...args));
}
