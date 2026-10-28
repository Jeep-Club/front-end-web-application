import z from 'zod'

export interface FetchWrapperProps<T> extends RequestInit {
    url: string;
    schema: z.ZodType<T>;
    responseType?: "json" | "blob";
}

export interface FetchWrapperResponse<T> {
    status: number;
    data: T;
}

export async function fetchWrapper<T>(props: FetchWrapperProps<T>): Promise<FetchWrapperResponse<T>> {

    const { schema, headers, url, responseType = "json", ...requestProps } = props;


    const requestHeaders = new Headers(headers);
    if (!requestHeaders.has('Accept')) requestHeaders.set('Accept', 'application/json');
    if (!requestHeaders.has('Accept-Language')) requestHeaders.set('Accept-Language', 'pt-BR');
    if (requestProps.body instanceof FormData) requestHeaders.delete('Content-Type');
    else if (!requestHeaders.has('Content-Type')) requestHeaders.set('Content-Type', 'application/json');
    const response = await fetch(url, {
        ...requestProps,
        headers: requestHeaders,
    });
    const status = response.status;
    if (response.ok && responseType === "blob") {
        const rawData = await response.blob();
        const data = schema.safeParse(rawData);
        if (!data.success) throw { zodError: data.error, rawData, status };
        return { status, data: data.data };
    }
    const responseText = await response.text();
    let rawData: unknown = responseText;

    if (responseText) {
        try {
            rawData = JSON.parse(responseText);
        } catch {
            rawData = responseText;
        }
    }

    if (!response.ok) {
        throw { rawData, status };
    }

    const data = schema.safeParse(rawData);

    if (!data.success) {
        throw { zodError: data.error, rawData, status };
    }

    return { status, data: data.data };
}
