// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/billing/download";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function downloadBillingAction(...args: Parameters<typeof server.downloadBillingAction>) {
    return unwrapActionResult(await server.downloadBillingAction(...args));
}
