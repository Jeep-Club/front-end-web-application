// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/vehicles/detail-for-edit";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function getVehicleDetailForEditAdminAction(...args: Parameters<typeof server.getVehicleDetailForEditAdminAction>) {
    return unwrapActionResult(await server.getVehicleDetailForEditAdminAction(...args));
}
