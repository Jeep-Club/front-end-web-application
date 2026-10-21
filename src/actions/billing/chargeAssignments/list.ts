// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/billing/chargeAssignments/list";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function listChargeAssignmentsAction(...args: Parameters<typeof server.listChargeAssignmentsAction>) {
    return unwrapActionResult(await server.listChargeAssignmentsAction(...args));
}
