"use server";

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import { z } from "zod";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { HttpAPIRoutes } from "@/utils/http/api";

const sessionSchema = z.object({
    id: z.number(),
    userId: z.number(),
    status: z.string(),
    createdAt: z.string(),
    expiresAt: z.string(),
    loggedOutAt: z.string().nullable(),
});

const refreshTokenSchema = z.object({
    id: z.number(),
    userId: z.number(),
    sessionId: z.number(),
    status: z.string(),
    createdAt: z.string(),
    expiresAt: z.string(),
    replacedByTokenId: z.number().nullable(),
});

const passwordRecoveryRequestSchema = z.object({
    id: z.number(),
    userId: z.number(),
    status: z.string(),
    method: z.string().nullable(),
    createdAt: z.string(),
    expiresAt: z.string(),
    resolvedAt: z.string().nullable(),
    cancelledAt: z.string().nullable(),
});

export type AdminSession = z.infer<typeof sessionSchema>;
export type AdminRefreshToken = z.infer<typeof refreshTokenSchema>;
export type AdminPasswordRecoveryRequest = z.infer<typeof passwordRecoveryRequestSchema>;

async function withAdminSecurityErrors<T>(fallback: string, request: () => Promise<T>): Promise<T> {
    try {
        return await request();
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, fallback), { cause: error });
    }
}

async function listAdminUserSessionsActionImpl(userId: number): Promise<AdminSession[]> {
    return withAdminSecurityErrors("Erro ao carregar sessões do usuário", async () => {
        const { data } = await actionFetchWrapper<AdminSession[]>({
            url: HttpAPIRoutes.ADMIN_USER_SESSIONS.replace("{userId}", String(userId)),
            method: "GET",
            schema: z.array(sessionSchema),
        });
        return data;
    });
}

async function logoutAdminSessionActionImpl(sessionId: number): Promise<AdminSession> {
    return withAdminSecurityErrors("Erro ao encerrar a sessão", async () => {
        const { data } = await actionFetchWrapper<AdminSession>({
            url: HttpAPIRoutes.ADMIN_SESSION_LOGOUT.replace("{sessionId}", String(sessionId)),
            method: "PATCH",
            schema: sessionSchema,
        });
        return data;
    });
}

async function listAdminUserRefreshTokensActionImpl(userId: number): Promise<AdminRefreshToken[]> {
    return withAdminSecurityErrors("Erro ao carregar tokens do usuário", async () => {
        const { data } = await actionFetchWrapper<AdminRefreshToken[]>({
            url: HttpAPIRoutes.ADMIN_USER_REFRESH_TOKENS.replace("{userId}", String(userId)),
            method: "GET",
            schema: z.array(refreshTokenSchema),
        });
        return data;
    });
}

async function revokeAdminRefreshTokenActionImpl(refreshTokenId: number): Promise<AdminRefreshToken> {
    return withAdminSecurityErrors("Erro ao revogar o token", async () => {
        const { data } = await actionFetchWrapper<AdminRefreshToken>({
            url: HttpAPIRoutes.ADMIN_REFRESH_TOKEN_REVOKE.replace("{refreshTokenId}", String(refreshTokenId)),
            method: "PATCH",
            schema: refreshTokenSchema,
        });
        return data;
    });
}

async function listAdminUserPasswordRecoveryRequestsActionImpl(userId: number): Promise<AdminPasswordRecoveryRequest[]> {
    return withAdminSecurityErrors("Erro ao carregar pedidos de recuperação", async () => {
        const { data } = await actionFetchWrapper<AdminPasswordRecoveryRequest[]>({
            url: HttpAPIRoutes.ADMIN_USER_PASSWORD_RECOVERY_REQUESTS.replace("{userId}", String(userId)),
            method: "GET",
            schema: z.array(passwordRecoveryRequestSchema),
        });
        return data;
    });
}

async function cancelAdminPasswordRecoveryRequestActionImpl(requestId: number): Promise<AdminPasswordRecoveryRequest> {
    return withAdminSecurityErrors("Erro ao cancelar o pedido de recuperação", async () => {
        const { data } = await actionFetchWrapper<AdminPasswordRecoveryRequest>({
            url: HttpAPIRoutes.ADMIN_PASSWORD_RECOVERY_CANCEL.replace("{requestId}", String(requestId)),
            method: "PATCH",
            schema: passwordRecoveryRequestSchema,
        });
        return data;
    });
}


export async function listAdminUserSessionsAction(...args: Parameters<typeof listAdminUserSessionsActionImpl>) {
    return captureAction(() => listAdminUserSessionsActionImpl(...args));
}


export async function logoutAdminSessionAction(...args: Parameters<typeof logoutAdminSessionActionImpl>) {
    return captureAction(() => logoutAdminSessionActionImpl(...args));
}


export async function listAdminUserRefreshTokensAction(...args: Parameters<typeof listAdminUserRefreshTokensActionImpl>) {
    return captureAction(() => listAdminUserRefreshTokensActionImpl(...args));
}


export async function revokeAdminRefreshTokenAction(...args: Parameters<typeof revokeAdminRefreshTokenActionImpl>) {
    return captureAction(() => revokeAdminRefreshTokenActionImpl(...args));
}


export async function listAdminUserPasswordRecoveryRequestsAction(...args: Parameters<typeof listAdminUserPasswordRecoveryRequestsActionImpl>) {
    return captureAction(() => listAdminUserPasswordRecoveryRequestsActionImpl(...args));
}


export async function cancelAdminPasswordRecoveryRequestAction(...args: Parameters<typeof cancelAdminPasswordRecoveryRequestActionImpl>) {
    return captureAction(() => cancelAdminPasswordRecoveryRequestActionImpl(...args));
}
