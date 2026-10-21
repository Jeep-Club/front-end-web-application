// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/vehicles/detail-for-edit-member";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function getVehicleDetailForEditAction(...args: Parameters<typeof server.getVehicleDetailForEditAction>) {
    return unwrapActionResult(await server.getVehicleDetailForEditAction(...args));
}
