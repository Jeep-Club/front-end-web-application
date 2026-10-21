// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/users/create-first-access";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function createFirstAccessUserAction(...args: Parameters<typeof server.createFirstAccessUserAction>) {
    return unwrapActionResult(await server.createFirstAccessUserAction(...args));
}
