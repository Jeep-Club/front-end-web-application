"use server";
import * as server from "@/server/actions/admin/users/options";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function listUserOptionsAction(...args: Parameters<typeof server.listUserOptionsAction>) {
    return unwrapActionResult(await server.listUserOptionsAction(...args));
}
