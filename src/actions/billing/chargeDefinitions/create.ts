// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/billing/chargeDefinitions/create";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function createChargeDefinitionAction(...args: Parameters<typeof server.createChargeDefinitionAction>) {
    return unwrapActionResult(await server.createChargeDefinitionAction(...args));
}
