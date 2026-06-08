import { fetchWrapper } from "@/services/fetchWrapper/fetchWrapper";
import { refreshTokenResponseSchema } from "@/schemas/auth/refresh/refreshTokenResponse";
import { HttpAPIRoutes } from "../http/api";

export default async function fetchRefreshToken({
    refreshToken,
    ApiURL
}: RefreshTokenRequest & {ApiURL: string} ): Promise<RefreshTokenResponse> {
    const response = await fetchWrapper<RefreshTokenResponse>({
        url: `${ApiURL}/${HttpAPIRoutes.REFRESH}`,
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
        schema: refreshTokenResponseSchema
    });
    return response.data;
}