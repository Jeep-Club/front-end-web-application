// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/auth/reset-password";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export default async function resetPasswordAction(...args: Parameters<typeof server.default>) {
    return unwrapActionResult(await server.default(...args));
}
