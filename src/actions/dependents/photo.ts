import * as server from '@/server/actions/dependents/photo';
import { unwrapActionResult } from '@/utils/actions/actionResult';

export async function saveDependentWithPhotoAction(...args: Parameters<typeof server.saveDependentWithPhotoAction>) {
    return unwrapActionResult(await server.saveDependentWithPhotoAction(...args));
}
export async function removeDependentPhotoAction(...args: Parameters<typeof server.removeDependentPhotoAction>) {
    return unwrapActionResult(await server.removeDependentPhotoAction(...args));
}
