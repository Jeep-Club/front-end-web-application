import { fetchWrapper, FetchWrapperProps, FetchWrapperResponse } from "./fetchWrapper";

interface ServerFetchWapperProps<T> extends FetchWrapperProps<T> {

}

interface ServerFetchWrapperResponse<T> extends FetchWrapperResponse<T> {

}

export default async function serverFetchWrapper<T>({ ...props }: ServerFetchWapperProps<T>): Promise<ServerFetchWrapperResponse<T>> {

    const { url, ...fetchProps } = props;

    const apiURL = process.env.API_URL;
    const access = process.env.ACCESS

    if (!apiURL || !access) {
        throw new Error("API_URL or ACCESS");
    }

    try {
        const response = await fetchWrapper<T>({ url: `${apiURL}/${url}`, ...fetchProps });

        return response
    } catch (error) {
        throw error
    }
}