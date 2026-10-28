import * as server from "@/server/actions/tools/photo";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function updateToolPhotoAction(...args: Parameters<typeof server.updateToolPhotoAction>) {
    return unwrapActionResult(await server.updateToolPhotoAction(...args));
}
