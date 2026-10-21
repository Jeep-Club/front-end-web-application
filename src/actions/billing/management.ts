// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/billing/management";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function listBillingAction(...args: Parameters<typeof server.listBillingAction>) {
    return unwrapActionResult(await server.listBillingAction(...args));
}

export async function getBillingAction(...args: Parameters<typeof server.getBillingAction>) {
    return unwrapActionResult(await server.getBillingAction(...args));
}

export async function mutateBillingAction(...args: Parameters<typeof server.mutateBillingAction>) {
    return unwrapActionResult(await server.mutateBillingAction(...args));
}
