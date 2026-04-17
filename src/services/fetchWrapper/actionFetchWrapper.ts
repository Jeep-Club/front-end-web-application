import { fetchWrapper, FetchWrapperProps, FetchWrapperResponse } from "./fetchWrapper";

interface ActionFetchWapperProps<T> extends FetchWrapperProps<T> {

}

interface ActionFetchWrapperResponse<T> extends FetchWrapperResponse<T> {

}

export default async function actionFetchWrapper<T>({ ...props }: ActionFetchWapperProps<T>): Promise<ActionFetchWrapperResponse<T>> {

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