"use server";

import * as server from "@/server/actions/publications/event-participants";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function listEventParticipantsAction(...args: Parameters<typeof server.listEventParticipantsAction>) {
    return unwrapActionResult(await server.listEventParticipantsAction(...args));
}
