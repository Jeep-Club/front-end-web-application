// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/billing/chargeDefinitions/get";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function getChargeDefinitionAction(...args: Parameters<typeof server.getChargeDefinitionAction>) {
    return unwrapActionResult(await server.getChargeDefinitionAction(...args));
}
