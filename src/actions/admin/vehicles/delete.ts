// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/vehicles/delete";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function deleteVehicleAdminAction(...args: Parameters<typeof server.deleteVehicleAdminAction>) {
    return unwrapActionResult(await server.deleteVehicleAdminAction(...args));
}
