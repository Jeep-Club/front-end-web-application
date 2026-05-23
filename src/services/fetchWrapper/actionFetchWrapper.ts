import { getAuthCookies } from "@/utils/auth/get";
import { fetchWrapper, FetchWrapperProps, FetchWrapperResponse } from "./fetchWrapper";
import { HttpStatus } from "@/utils/http/status";
import logoutAction from "@/actions/logout";
import fetchRefreshToken from "@/utils/auth/refresh";
import { login } from "@/utils/auth/login";

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

    try {
        const authCookies = await getAuthCookies.SERVER();
        fetchProps.headers = {
            ...fetchProps.headers,
            ...(authCookies?.AuthAccessToken ? {'Authorization': `Bearer ${authCookies.AuthAccessToken}`} : {})
        }

        const response = await fetchWrapper<T>({ url: `${apiURL}/${url}`, ...fetchProps });
        
        
        
        if (response.status === HttpStatus.TOKEN_EXPIRED) {
            if (!authCookies) {
                logoutAction();
                throw new Error('No auth cookies found');
            }
            try {
                const refreshResponse = await fetchRefreshToken({
                    ApiURL: apiURL,
                    refreshToken: authCookies.AuthRefreshToken,
                });
                await login(refreshResponse.accessToken, refreshResponse.refreshToken, refreshResponse.expiresInSeconds);
                const retryResponse = await fetchWrapper<T>({ url: `${apiURL}/${url}`, ...fetchProps });
                return retryResponse;
            } catch (refreshError) {
                logoutAction();
                throw refreshError;
            }
        }
        return response;
    } catch (error) {
        throw error
    }
}