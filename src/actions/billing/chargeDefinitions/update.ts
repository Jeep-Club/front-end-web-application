// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/billing/chargeDefinitions/update";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function updateChargeDefinitionAction(...args: Parameters<typeof server.updateChargeDefinitionAction>) {
    return unwrapActionResult(await server.updateChargeDefinitionAction(...args));
}
