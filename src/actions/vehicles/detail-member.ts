// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/vehicles/detail-member";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function getVehicleDetailAction(...args: Parameters<typeof server.getVehicleDetailAction>) {
    return unwrapActionResult(await server.getVehicleDetailAction(...args));
}
