// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/billing/chargeDefinitions/list";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function listChargeDefinitionsAction(...args: Parameters<typeof server.listChargeDefinitionsAction>) {
    return unwrapActionResult(await server.listChargeDefinitionsAction(...args));
}
