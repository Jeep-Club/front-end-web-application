import z from 'zod';
import { logFetchFailure } from './logFetchFailure';

export interface FetchWrapperProps<T> extends RequestInit {
    url: string;
    schema: z.ZodType<T>;
    responseType?: 'json' | 'blob';
    allowedContentTypes?: readonly string[];
}

export interface FetchWrapperResponse<T> {
    status: number;
    data: T;
}

export async function fetchWrapper<T>(props: FetchWrapperProps<T>): Promise<FetchWrapperResponse<T>> {

    const { schema, headers, url, responseType = 'json', allowedContentTypes = [], ...requestProps } = props;

    const requestHeaders = new Headers(headers);
    if (!requestHeaders.has('Accept')) requestHeaders.set('Accept', responseType === 'blob' ? [...allowedContentTypes, 'application/problem+json'].join(', ') : 'application/json');
    if (!requestHeaders.has('Accept-Language')) requestHeaders.set('Accept-Language', 'pt-BR');
    if (requestProps.body instanceof FormData) requestHeaders.delete('Content-Type');
    else if (!requestHeaders.has('Content-Type')) requestHeaders.set('Content-Type', 'application/json');
    const method = requestProps.method ?? 'GET';
    let response: Response;
    try {
        response = await fetch(url, {
            ...requestProps,
            headers: requestHeaders,
        });
    } catch (error) {
        logFetchFailure({ url, method, failure: { stage: 'NETWORK', error } });
        throw error;
    }
    const status = response.status;
    const diagnosticResponse = (rawData: unknown) => ({
        status, statusText: response.statusText, contentType: response.headers.get('content-type'), rawData,
    });
    // A 204 has no representation, regardless of the JSON schema used by callers.
    if (status === 204 && responseType === 'json') return { status, data: undefined as T };

    const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
    const isJson = contentType === 'application/json' || contentType?.endsWith('+json');
    if (responseType === 'blob' && response.ok && !isJson) {
        if (status === 204 || !contentType || !allowedContentTypes.includes(contentType)) {
            logFetchFailure({ url, method, response: diagnosticResponse(null), failure: {
                stage: 'CONTENT_TYPE', allowedContentTypes, receivedContentType: contentType,
                message: 'Download rejeitado. Corpo não consumido porque o Content-Type não é permitido ou a resposta é 204.',
            } });
            throw { status, code: 'INVALID_RESPONSE', rawData: null };
        }
        const blob = await response.blob();
        const parsed = schema.safeParse(blob);
        if (!parsed.success) {
            logFetchFailure({ url, method, response: diagnosticResponse({ binary: true, type: blob.type, size: blob.size }), failure: {
                stage: 'ZOD_PARSE', issues: parsed.error.issues,
            } });
            throw { status, code: 'INVALID_RESPONSE', rawData: null };
        }
        return { status, data: parsed.data };
    }
    let responseText: string;
    try {
        responseText = await response.text();
    } catch (error) {
        logFetchFailure({ url, method, response: diagnosticResponse(null), failure: { stage: 'READ_RESPONSE', error } });
        throw error;
    }
    let rawData: unknown = responseText;
    let jsonParseError: unknown;

    if (responseText) {
        try {
            rawData = JSON.parse(responseText);
        } catch (error) {
            jsonParseError = error;
            rawData = responseText;
        }
    }

    // Even a misconfigured 200 JSON response must never become a download.
    if (!response.ok || contentType === 'application/problem+json' || responseType === 'blob') {
        logFetchFailure({ url, method, response: diagnosticResponse(rawData), failure: {
            stage: !response.ok ? 'HTTP_STATUS' : contentType === 'application/problem+json' ? 'API_PROBLEM' : 'DOWNLOAD_JSON_RESPONSE',
            message: !response.ok ? 'A API retornou um status HTTP de erro.' : 'A resposta contém JSON de erro ou JSON no lugar de um arquivo.',
            ...(jsonParseError ? { jsonParseError } : {}),
        } });
        throw { rawData, status };
    }

    const data = schema.safeParse(rawData);

    if (!data.success) {
        logFetchFailure({ url, method, response: diagnosticResponse(rawData), failure: {
            stage: jsonParseError ? 'JSON_PARSE' : 'ZOD_PARSE',
            message: jsonParseError ? 'O corpo não é JSON válido e também não atende ao schema de resposta.' : 'O status HTTP é de sucesso, mas o corpo não atende ao schema de resposta.',
            issues: data.error.issues,
            ...(jsonParseError ? { jsonParseError } : {}),
        } });
        throw { zodError: data.error, rawData, status };
    }

    return { status, data: data.data };
}
