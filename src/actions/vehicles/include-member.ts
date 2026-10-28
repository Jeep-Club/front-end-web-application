// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/vehicles/include-member";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function includeVehicleMemberAction(...args: Parameters<typeof server.includeVehicleMemberAction>) {
    return unwrapActionResult(await server.includeVehicleMemberAction(...args));
}
