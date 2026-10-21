// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/vehicles/list-member";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function listVehiclesMemberAction(...args: Parameters<typeof server.listVehiclesMemberAction>) {
    return unwrapActionResult(await server.listVehiclesMemberAction(...args));
}
