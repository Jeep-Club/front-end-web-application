import { getAuthCookies } from "@/utils/auth/get";
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
    fetchProps.headers = {
        ...fetchProps.headers,
        ...(authCookies?.AuthAccessToken ? {'Authorization': `Bearer ${authCookies.AuthAccessToken}`} : {})
    }

    try {
        const response = await fetchWrapper<T>({ url: `${apiURL}/${url}`, ...fetchProps });

        return response
    } catch (error) {
        throw error
    }
}