// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/vehicles/detail";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function getVehicleDetailAdminAction(...args: Parameters<typeof server.getVehicleDetailAdminAction>) {
    return unwrapActionResult(await server.getVehicleDetailAdminAction(...args));
}
