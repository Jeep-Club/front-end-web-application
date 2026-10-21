// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/vehicles/delete-member";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function deleteVehicleMemberAction(...args: Parameters<typeof server.deleteVehicleMemberAction>) {
    return unwrapActionResult(await server.deleteVehicleMemberAction(...args));
}
