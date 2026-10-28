// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/auth/complete-first-access-onboarding";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function completeFirstAccessOnboardingAction(...args: Parameters<typeof server.completeFirstAccessOnboardingAction>) {
    return unwrapActionResult(await server.completeFirstAccessOnboardingAction(...args));
}
