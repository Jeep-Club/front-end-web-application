// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/billing/memberCharges/listMine";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function listMyMemberChargesAction(...args: Parameters<typeof server.listMyMemberChargesAction>) {
    return unwrapActionResult(await server.listMyMemberChargesAction(...args));
}
