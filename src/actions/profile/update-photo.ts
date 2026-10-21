// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/profile/update-photo";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function updateProfilePhotoAction(...args: Parameters<typeof server.updateProfilePhotoAction>) {
    return unwrapActionResult(await server.updateProfilePhotoAction(...args));
}
