// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/billing/chargeAssignments/activate";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function activateChargeAssignmentAction(...args: Parameters<typeof server.activateChargeAssignmentAction>) {
    return unwrapActionResult(await server.activateChargeAssignmentAction(...args));
}
