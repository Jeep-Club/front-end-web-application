// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/membership/submit-application";
import { unwrapActionResult } from "@/utils/actions/actionResult";
export type { MembershipApplicationActionResult } from "@/server/actions/membership/submit-application";

export async function submitMembershipApplicationAction(...args: Parameters<typeof server.submitMembershipApplicationAction>) {
    return unwrapActionResult(await server.submitMembershipApplicationAction(...args));
}
