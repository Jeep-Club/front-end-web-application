// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/billing/chargeDefinitions/archive";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function archiveChargeDefinitionAction(...args: Parameters<typeof server.archiveChargeDefinitionAction>) {
    return unwrapActionResult(await server.archiveChargeDefinitionAction(...args));
}
