// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/vehicles/edit";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function editVehicleAdminAction(...args: Parameters<typeof server.editVehicleAdminAction>) {
    return unwrapActionResult(await server.editVehicleAdminAction(...args));
}
