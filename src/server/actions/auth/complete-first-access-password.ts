'use server';

import { ActionError } from "@/utils/http/ActionError";

import { completeFirstAccessResponseSchema } from "@/schemas/auth/complete-first-access";
import type { FirstAccessPasswordForm } from "@/schemas/auth/first-access-password";
import { authorizationMeResponseSchema,identityMeResponseSchema,meResponseSchema } from "@/schemas/auth/me/me";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { authCookieOptions } from "@/utils/auth/cookieOptions";
import { login } from "@/utils/auth/login";
import { logout } from "@/utils/auth/logout";
import { me } from "@/utils/auth/me";
import { HttpAPIRoutes } from "@/utils/http/api";
import { cookies } from "next/headers";

export async function completeFirstAccessPasswordAction(data: FirstAccessPasswordForm) {
    const cookieStore = await cookies();
    const passwordChangeToken = cookieStore.get("FirstAccessPasswordChangeToken")?.value;
    if (!passwordChangeToken) throw new ActionError("O prazo para criar sua senha expirou. Entre novamente com a senha temporária.");

    try {
        const response = await actionFetchWrapper<AuthResponse>({
            url: HttpAPIRoutes.COMPLETE_REQUIRED_PASSWORD_CHANGE,
            method: "POST",
            body: JSON.stringify({ passwordChangeToken, newPassword: data.password }),
            schema: completeFirstAccessResponseSchema,
        });

        await login(
            response.data.accessToken,
            response.data.refreshToken,
            new Date(Date.now() + response.data.expiresInSeconds * 1000).toISOString(),
        );

        const [sessionResponse, identityResponse, authorizationResponse] = await Promise.all([
            actionFetchWrapper<MeResponse>({ url: HttpAPIRoutes.AUTHENTICATION_ME, method: "GET", schema: meResponseSchema }),
            actionFetchWrapper<IdentityMeResponse>({ url: HttpAPIRoutes.IDENTITY_ME, method: "GET", schema: identityMeResponseSchema }),
            actionFetchWrapper<AuthorizationMeResponse>({ url: HttpAPIRoutes.AUTHORIZATION_ME, method: "GET", schema: authorizationMeResponseSchema }),
        ]);
        await me(sessionResponse.data, identityResponse.data, authorizationResponse.data);

        const firstAccess = cookieStore.get("FirstAccessPasswordChangePending")?.value === "true";
        if (firstAccess) {
            cookieStore.set("FirstAccessOnboardingUserId", String(identityResponse.data.id), {
                ...authCookieOptions(true),
                maxAge: 60 * 60 * 24 * 90,
            });
        }
        cookieStore.delete("FirstAccessPasswordChangeToken");
        cookieStore.delete("FirstAccessPasswordChangePending");
        return { firstAccess };
    } catch (error) {
        await logout();
        throw error;
    }
}
