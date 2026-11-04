import { getAuthCookies } from '@/utils/auth/get';
import { toActionError } from '@/utils/http/apiError';
import { fetchWrapper,FetchWrapperProps,FetchWrapperResponse } from './fetchWrapper';
import { frontendHeaders } from './frontendHeaders';

export default async function serverFetchWrapper<T>({ url, ...props }: FetchWrapperProps<T>): Promise<FetchWrapperResponse<T>> {
    try {
        const apiURL = process.env.API_URL;
        if (!apiURL) throw new Error('API_URL is not defined');
        const auth = await getAuthCookies.SERVER();
        const headers = new Headers(props.headers);
        if (auth?.AuthAccessToken) headers.set('Authorization', `Bearer ${auth.AuthAccessToken}`);
        return await fetchWrapper<T>({ ...props, url: `${apiURL.replace(/\/$/, '')}/${url}`, headers: frontendHeaders(headers) });
    } catch (error) {
        throw toActionError(error);
    }
}
