// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/vehicles/list";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function listVehiclesAdminAction(...args: Parameters<typeof server.listVehiclesAdminAction>) {
    return unwrapActionResult(await server.listVehiclesAdminAction(...args));
}
