// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/auth/forgot-password-email-token";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export default async function forgotPasswordEmailTokenAction(...args: Parameters<typeof server.default>) {
    return unwrapActionResult(await server.default(...args));
}
