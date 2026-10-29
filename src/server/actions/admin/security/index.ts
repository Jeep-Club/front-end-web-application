"use server";

import { z } from "zod";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
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

export async function listAdminUserSessionsAction(userId: number): Promise<AdminSession[]> {

    const { data } = await actionFetchWrapper<AdminSession[]>({
        url: HttpAPIRoutes.ADMIN_USER_SESSIONS.replace("{userId}", String(userId)),
        method: "GET",
        schema: z.array(sessionSchema),
    });
    return data;
}

export async function logoutAdminSessionAction(sessionId: number): Promise<AdminSession> {

    const { data } = await actionFetchWrapper<AdminSession>({
        url: HttpAPIRoutes.ADMIN_SESSION_LOGOUT.replace("{sessionId}", String(sessionId)),
        method: "PATCH",
        schema: sessionSchema,
    });
    return data;
}

export async function listAdminUserRefreshTokensAction(userId: number): Promise<AdminRefreshToken[]> {

    const { data } = await actionFetchWrapper<AdminRefreshToken[]>({
        url: HttpAPIRoutes.ADMIN_USER_REFRESH_TOKENS.replace("{userId}", String(userId)),
        method: "GET",
        schema: z.array(refreshTokenSchema),
    });
    return data;
}

export async function revokeAdminRefreshTokenAction(refreshTokenId: number): Promise<AdminRefreshToken> {

    const { data } = await actionFetchWrapper<AdminRefreshToken>({
        url: HttpAPIRoutes.ADMIN_REFRESH_TOKEN_REVOKE.replace("{refreshTokenId}", String(refreshTokenId)),
        method: "PATCH",
        schema: refreshTokenSchema,
    });
    return data;
}

export async function listAdminUserPasswordRecoveryRequestsAction(userId: number): Promise<AdminPasswordRecoveryRequest[]> {

    const { data } = await actionFetchWrapper<AdminPasswordRecoveryRequest[]>({
        url: HttpAPIRoutes.ADMIN_USER_PASSWORD_RECOVERY_REQUESTS.replace("{userId}", String(userId)),
        method: "GET",
        schema: z.array(passwordRecoveryRequestSchema),
    });
    return data;
}

export async function cancelAdminPasswordRecoveryRequestAction(requestId: number): Promise<AdminPasswordRecoveryRequest> {

    const { data } = await actionFetchWrapper<AdminPasswordRecoveryRequest>({
        url: HttpAPIRoutes.ADMIN_PASSWORD_RECOVERY_CANCEL.replace("{requestId}", String(requestId)),
        method: "PATCH",
        schema: passwordRecoveryRequestSchema,
    });
    return data;
}
