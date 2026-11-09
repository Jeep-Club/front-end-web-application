import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cookies } from "next/headers";

import { meCookieSchema } from "@/schemas/auth/me/me";
import { verifyWithSchema } from "@/services/token/verify";
import { ActionError } from "@/utils/http/ActionError";

/** Resolves the signed current operator for an already-authorized administrative export. */
export async function getAdminExportOperatorName() {
    const token = (await cookies()).get("Me")?.value;
    if (!token) throw new ActionError("Não foi possível identificar quem está gerando o relatório.");
    const operator = await verifyWithSchema<MeCookie>(token, meCookieSchema);
    if (!operator.userName.trim()) throw new ActionError("Não foi possível identificar quem está gerando o relatório.");
    return operator.userName;
}

/** Resolves the signed current operator and club seal for a branded admin PDF. */
export async function getAdminPdfIdentity() {
    const exportedBy = await getAdminExportOperatorName();
    const seal = await readFile(join(process.cwd(), "public", "images", "jeepclube-emblema.png"));
    return { exportedBy, seal: `data:image/png;base64,${seal.toString("base64")}` };
}
