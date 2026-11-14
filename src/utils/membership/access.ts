import { getActionFailure } from "@/utils/http/ActionError";

export type MembershipAccess = "allowed" | "payment-required" | "unavailable";
export const PAYMENT_HISTORY_PATH = "/financeiro";

/** Only the backend's explicit 402 contract establishes nonpayment. Outages never do. */
export async function resolveMembershipAccess(request: () => Promise<unknown>): Promise<MembershipAccess> {
    try {
        await request();
        return "allowed";
    } catch (error) {
        const failure = getActionFailure(error);
        if (failure?.status === 401) throw error;
        if (failure?.status === 402 && failure.code === "MEMBERSHIP_PAYMENT_REQUIRED") return "payment-required";
        return "unavailable";
    }
}

export function canAccessMembershipPage(access: MembershipAccess, pathname: string): boolean {
    return access === "allowed" || pathname === PAYMENT_HISTORY_PATH;
}
