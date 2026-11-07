import { getAuthCookies } from '@/utils/auth/get';
import { login } from '@/utils/auth/login';
import fetchRefreshToken from '@/utils/auth/refresh';
import { getApiProblem,isSessionInvalidError,SESSION_EXPIRED_MESSAGE,toActionError } from '@/utils/http/apiError';
import { fetchWrapper,FetchWrapperProps,FetchWrapperResponse } from './fetchWrapper';
import { frontendHeaders } from './frontendHeaders';

export default async function actionFetchWrapper<T>(props: FetchWrapperProps<T>): Promise<FetchWrapperResponse<T>> {
    try {
        const { url, ...fetchProps } = props;
        const apiURL = process.env.API_URL;
        if (!apiURL) throw new Error('API_URL is not defined');
        const auth = await getAuthCookies.SERVER();
        const headers = new Headers(fetchProps.headers);
        if (auth?.AuthAccessToken) headers.set('Authorization', `Bearer ${auth.AuthAccessToken}`);
        const request = () => fetchWrapper<T>({ ...fetchProps, url: `${apiURL.replace(/\/$/, '')}/${url}`, headers: frontendHeaders(headers) });
        try {
            return await request();
        } catch (error) {
            if (!isSessionInvalidError(error)) throw error;
            if (!auth?.AuthRefreshToken) throw new Error(SESSION_EXPIRED_MESSAGE);
            let tokens: RefreshTokenResponse;
            try {
                tokens = await fetchRefreshToken({ ApiURL: apiURL, refreshToken: auth.AuthRefreshToken });
            } catch (refreshError) {
                // An outage during refresh is recoverable and must keep the session.
                const problem = getApiProblem(refreshError);
                if (problem?.status === 401 || problem?.code === 'REFRESH_TOKEN_NOT_FOUND') throw new Error(SESSION_EXPIRED_MESSAGE);
                throw refreshError;
            }
            await login(tokens.accessToken, tokens.refreshToken, new Date(Date.now() + tokens.expiresInSeconds * 1000).toISOString());
            headers.set('Authorization', `Bearer ${tokens.accessToken}`);
            try {
                return await request();
            } catch (retryError) {
                if (isSessionInvalidError(retryError)) throw new Error(SESSION_EXPIRED_MESSAGE);
                throw retryError;
            }
        }
    } catch (error) {
        throw toActionError(error);
    }
}
