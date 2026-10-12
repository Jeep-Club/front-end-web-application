import { getAuthCookies } from "@/utils/auth/get";
import { frontendHeaders } from './frontendHeaders';
import { fetchWrapper, FetchWrapperProps, FetchWrapperResponse } from "./fetchWrapper";

interface ServerFetchWapperProps<T> extends FetchWrapperProps<T> {

}

interface ServerFetchWrapperResponse<T> extends FetchWrapperResponse<T> {

}

export default async function serverFetchWrapper<T>({ ...props }: ServerFetchWapperProps<T>): Promise<ServerFetchWrapperResponse<T>> {

    const { url, ...fetchProps } = props;

    const apiURL = process.env.API_URL;

    if (!apiURL) {
        throw new Error("API_URL is not defined");
    }

    const authCookies = await getAuthCookies.SERVER();
    const requestHeaders = new Headers(fetchProps.headers);
    if (authCookies?.AuthAccessToken) requestHeaders.set('Authorization', `Bearer ${authCookies.AuthAccessToken}`);
    fetchProps.headers = frontendHeaders(requestHeaders);

    try {
        const response = await fetchWrapper<T>({ url: `${apiURL}/${url}`, ...fetchProps });

        return response
    } catch (error) {
        throw error
    }
}
