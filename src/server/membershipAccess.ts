import "server-only";
import { cache } from "react";
import { z } from "zod";
import { redirect } from "next/navigation";
import { getActionFailure } from "@/utils/http/ActionError";
import serverFetchWrapper from "@/services/fetchWrapper/serverFetchWrapper";
import { resolveMembershipAccess } from "@/utils/membership/access";

/** No access-status endpoint exists. This read runs @RequiresMembership before the feed query.
 * cache deduplicates only within a server render; no payment decision persists across requests.
 */
export const getMembershipAccess = cache(async () => {
    try {
        return await resolveMembershipAccess(() => serverFetchWrapper({
            url: "publications/feed?page=0&size=1",
            method: "GET",
            cache: "no-store",
            signal: AbortSignal.timeout(10_000),
            schema: z.object({ content: z.array(z.unknown()) }),
        }));
    } catch (error) {
        if (getActionFailure(error)?.status === 401) redirect("/api/auth/logout");
        throw error;
    }
});
