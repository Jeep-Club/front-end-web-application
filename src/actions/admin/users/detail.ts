// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/users/detail";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function getAdminUserAction(...args: Parameters<typeof server.getAdminUserAction>) {
    return unwrapActionResult(await server.getAdminUserAction(...args));
}
