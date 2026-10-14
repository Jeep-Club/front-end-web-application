"use server";

import { z } from "zod";
import { getAuthCookies } from "@/utils/auth/get";
import { frontendHeaders } from "@/services/fetchWrapper/frontendHeaders";
import fetchRefreshToken from "@/utils/auth/refresh";
import { login } from "@/utils/auth/login";
import { extractApiErrorMessage, SESSION_EXPIRED_MESSAGE } from "@/utils/http/apiError";

export async function downloadBillingAction(kind: "definitions" | "cycles" | "member-charges" | "payments" | "refunds" | "receipt", format: "CSV" | "PDF", filters: Record<string, string> = {}, paymentId?: number) {
    z.enum(["definitions", "cycles", "member-charges", "payments", "refunds", "receipt"]).parse(kind);
    z.enum(["CSV", "PDF"]).parse(format);
    const allowedFilters = ["id", "userId", "chargeDefinitionId", "chargeCycleId", "eventId", "recurrence", "year", "month", "status", "paymentMethod", "chargeStatus", "effectiveStatus", "dueFrom", "dueTo", "from", "to"];
    const query = new URLSearchParams({ format });
    for (const [key, value] of Object.entries(filters)) if (allowedFilters.includes(key) && value) query.set(key, value);
    const path = kind === "receipt" ? `billing/member-payments/${z.number().int().positive().parse(paymentId)}/receipt` : `billing/admin/${kind}/export?${query}`;
    const apiURL = process.env.API_URL;
    if (!apiURL) throw new Error("API_URL não configurada.");
    const auth = await getAuthCookies.SERVER();
    if (!auth) throw new Error(SESSION_EXPIRED_MESSAGE);
    const request = (token: string) => fetch(`${apiURL}/${path}`, { cache: "no-store", headers: frontendHeaders({ Authorization: `Bearer ${token}`, "Accept-Language": "pt-BR" }) });
    let response = await request(auth.AuthAccessToken);
    if (response.status === 401) {
        try {
            const tokens = await fetchRefreshToken({ ApiURL: apiURL, refreshToken: auth.AuthRefreshToken });
            await login(tokens.accessToken, tokens.refreshToken, new Date(Date.now() + tokens.expiresInSeconds * 1000).toISOString());
            response = await request(tokens.accessToken);
        } catch { throw new Error(SESSION_EXPIRED_MESSAGE); }
    }
    if (!response.ok) {
        const rawData = await response.json().catch(() => null);
        throw new Error(extractApiErrorMessage({ rawData, status: response.status }, "Não foi possível baixar o arquivo."));
    }
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const extension = kind !== "receipt" ? format.toLowerCase() : contentType.includes("pdf") ? "pdf" : contentType.includes("jpeg") ? "jpg" : contentType.includes("webp") ? "webp" : "png";
    return { base64: Buffer.from(await response.arrayBuffer()).toString("base64"), contentType, filename: kind === "receipt" ? `comprovante-${paymentId}.${extension}` : `financeiro-${kind}.${extension}` };
}
