// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/billing/chargeDefinitions/deactivate";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function deactivateChargeDefinitionAction(...args: Parameters<typeof server.deactivateChargeDefinitionAction>) {
    return unwrapActionResult(await server.deactivateChargeDefinitionAction(...args));
}
