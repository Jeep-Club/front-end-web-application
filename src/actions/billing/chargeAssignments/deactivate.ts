// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/billing/chargeAssignments/deactivate";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function deactivateChargeAssignmentAction(...args: Parameters<typeof server.deactivateChargeAssignmentAction>) {
    return unwrapActionResult(await server.deactivateChargeAssignmentAction(...args));
}
