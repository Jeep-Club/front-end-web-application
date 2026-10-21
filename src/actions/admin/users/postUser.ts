// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/users/postUser";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function postUserAction(...args: Parameters<typeof server.postUserAction>) {
    return unwrapActionResult(await server.postUserAction(...args));
}
