"use server";

import { z } from "zod";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { resolveMembershipAccess } from "@/utils/membership/access";

/** Rechecks the server's membership gate; the action wrapper may refresh expired tokens. */
export async function getMembershipAccessAction() {
    return resolveMembershipAccess(() => actionFetchWrapper({
        url: "publications/feed?page=0&size=1",
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
        schema: z.object({ content: z.array(z.unknown()) }),
    }));
}
