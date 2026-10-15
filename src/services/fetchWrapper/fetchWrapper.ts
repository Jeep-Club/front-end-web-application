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


    const response = await fetch(url, {
        ...requestProps,
        headers: {
            'Accept': 'application/json',
            'Accept-Language': 'pt-BR',
            ...headers,
            'Content-Type': 'application/json'
        },
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
