// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/billing/chargeCycles/generate";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function generateChargeCycleAction(...args: Parameters<typeof server.generateChargeCycleAction>) {
    return unwrapActionResult(await server.generateChargeCycleAction(...args));
}
