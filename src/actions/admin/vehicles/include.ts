// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/vehicles/include";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function includeVehicleAdminAction(...args: Parameters<typeof server.includeVehicleAdminAction>) {
    return unwrapActionResult(await server.includeVehicleAdminAction(...args));
}
