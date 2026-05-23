import z from 'zod'

export interface FetchWrapperProps<T> extends RequestInit {
    url: string;
    schema: z.ZodType<T>;
}

export interface FetchWrapperResponse<T> {
    status: number;
    data: T;
}

export async function fetchWrapper<T>(props: FetchWrapperProps<T>): Promise<FetchWrapperResponse<T>> {

    const { schema, headers, url, ...requestProps } = props;


    try {
        const response = await fetch(`${url}`, {
            ...requestProps,
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
        })
        console.log(`${url}`, {
            ...requestProps,
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
        })
        const status = response.status;

        const rawData = await response.clone().json().catch(async () => { return await response.text().catch(() => null) });
        console.log('Raw response data:', await response.json().catch(async () => { return await response.text().catch(() => null) }));
        console.log('Response status:', status);
        const data = schema.safeParse(rawData);


        if (!data.success) {
            throw { zodError: data.error, rawData, status };
        }

        return { status, data: data.data };

    } catch (error) {
        throw error;
    }

}