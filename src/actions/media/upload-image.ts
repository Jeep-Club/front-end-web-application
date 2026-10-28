// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/media/upload-image";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function uploadImageAction(...args: Parameters<typeof server.uploadImageAction>) {
    return unwrapActionResult(await server.uploadImageAction(...args));
}
