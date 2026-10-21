// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/vehicles/edit-member";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function editVehicleMemberAction(...args: Parameters<typeof server.editVehicleMemberAction>) {
    return unwrapActionResult(await server.editVehicleMemberAction(...args));
}
