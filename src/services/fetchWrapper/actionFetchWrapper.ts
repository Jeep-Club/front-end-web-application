import { getAuthCookies } from "@/utils/auth/get";
import { fetchWrapper, FetchWrapperProps, FetchWrapperResponse } from "./fetchWrapper";
import fetchRefreshToken from "@/utils/auth/refresh";
import { login } from "@/utils/auth/login";
import { isSessionInvalidError, SESSION_EXPIRED_MESSAGE } from "@/utils/http/apiError";

interface ActionFetchWapperProps<T> extends FetchWrapperProps<T> {

}

interface ActionFetchWrapperResponse<T> extends FetchWrapperResponse<T> {

}

export default async function actionFetchWrapper<T>({ ...props }: ActionFetchWapperProps<T>): Promise<ActionFetchWrapperResponse<T>> {

    const { url, ...fetchProps } = props;

    const apiURL = process.env.API_URL;

    if (!apiURL) {
        throw new Error("API_URL is not defined");
    }

    const authCookies = await getAuthCookies.SERVER();
    fetchProps.headers = {
        ...fetchProps.headers,
        ...(authCookies?.AuthAccessToken ? { 'Authorization': `Bearer ${authCookies.AuthAccessToken}` } : {})
    }

    try {
        return await fetchWrapper<T>({ url: `${apiURL}/${url}`, ...fetchProps });
    } catch (error) {
        if (!isSessionInvalidError(error)) {
            throw error;
        }

        // Token invalido/expirado e sem refresh token pra tentar renovar:
        // sessao nao tem mais o que fazer. O redirect pro login acontece no
        // client (ver handlers globais de erro do QueryProvider) — chamar
        // redirect() aqui seria engolido pelo try/catch de cada action.
        if (!authCookies?.AuthRefreshToken) {
            throw new Error(SESSION_EXPIRED_MESSAGE);
        }

        try {
            const refreshResponse = await fetchRefreshToken({
                ApiURL: apiURL,
                refreshToken: authCookies.AuthRefreshToken,
            });
            await login(
                refreshResponse.accessToken,
                refreshResponse.refreshToken,
                new Date(Date.now() + refreshResponse.expiresInSeconds * 1000).toISOString(),
            );

            return await fetchWrapper<T>({
                url: `${apiURL}/${url}`,
                ...fetchProps,
                headers: { ...fetchProps.headers, 'Authorization': `Bearer ${refreshResponse.accessToken}` },
            });
        } catch {
            // Refresh token tambem invalido/expirado: nao ha como renovar
            // a sessao.
            throw new Error(SESSION_EXPIRED_MESSAGE);
        }
    }
}