// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/billing/chargeAssignments/assign";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function assignChargeToAllMembersAction(...args: Parameters<typeof server.assignChargeToAllMembersAction>) {
    return unwrapActionResult(await server.assignChargeToAllMembersAction(...args));
}

export async function assignChargeToUserAction(...args: Parameters<typeof server.assignChargeToUserAction>) {
    return unwrapActionResult(await server.assignChargeToUserAction(...args));
}

export async function assignChargeToRoleAction(...args: Parameters<typeof server.assignChargeToRoleAction>) {
    return unwrapActionResult(await server.assignChargeToRoleAction(...args));
}

export async function assignChargeToEventParticipantsAction(...args: Parameters<typeof server.assignChargeToEventParticipantsAction>) {
    return unwrapActionResult(await server.assignChargeToEventParticipantsAction(...args));
}
