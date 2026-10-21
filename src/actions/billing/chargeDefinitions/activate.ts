// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/billing/chargeDefinitions/activate";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function activateChargeDefinitionAction(...args: Parameters<typeof server.activateChargeDefinitionAction>) {
    return unwrapActionResult(await server.activateChargeDefinitionAction(...args));
}
