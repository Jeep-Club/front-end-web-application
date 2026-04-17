import { fetchWrapper, FetchWrapperProps, FetchWrapperResponse } from "./fetchWrapper";

interface ClientFetchWapperProps<T> extends FetchWrapperProps<T> {

}

interface ClientFetchWrapperResponse<T> extends FetchWrapperResponse<T> {

}

export default async function serverFetchWrapper<T>({ ...props }: ClientFetchWapperProps<T>): Promise<ClientFetchWrapperResponse<T>> {

    const { url, ...fetchProps } = props;

    const apiURL = process.env.NEXT_PUBLIC_API_URL;

    if (!apiURL) {
        throw new Error("NEXT_PUBLIC_API_URL");
    }

    try {
        const response = await fetchWrapper<T>({ url: `${apiURL}/${url}`, ...fetchProps });

        return response
    } catch (error) {
        throw error
    }
}