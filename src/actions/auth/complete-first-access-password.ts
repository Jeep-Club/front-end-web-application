// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/auth/complete-first-access-password";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function completeFirstAccessPasswordAction(...args: Parameters<typeof server.completeFirstAccessPasswordAction>) {
    return unwrapActionResult(await server.completeFirstAccessPasswordAction(...args));
}
