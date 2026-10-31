interface FetchDiagnostic {
    url: string;
    method: string;
    response?: {
        status: number;
        statusText: string;
        contentType: string | null;
        rawData: unknown;
    };
    failure: {
        stage: 'NETWORK' | 'READ_RESPONSE' | 'HTTP_STATUS' | 'API_PROBLEM' | 'DOWNLOAD_JSON_RESPONSE' | 'CONTENT_TYPE' | 'JSON_PARSE' | 'ZOD_PARSE';
        [key: string]: unknown;
    };
}

const SECRET_FIELD = /^(?:authorization|cookie|set-cookie|x-frontend-key|accessToken|refreshToken|passwordChangeToken|token|senha|password|newPassword|confirmPassword|secret|passwordHash|tokenHash)$/i;

function diagnosticUrl(url: string): string {
    try {
        const absolute = /^https?:\/\//i.test(url);
        const parsed = new URL(url, 'http://diagnostic.invalid');
        parsed.username = '';
        parsed.password = '';
        for (const key of [...parsed.searchParams.keys()]) {
            if (SECRET_FIELD.test(key)) parsed.searchParams.set(key, '[REDACTED]');
        }
        return absolute ? parsed.toString() : `${parsed.pathname}${parsed.search}`;
    } catch {
        return '[URL inválida]';
    }
}

function printable(value: unknown): string {
    return JSON.stringify(value, (key, item: unknown) => {
        if (SECRET_FIELD.test(key)) return '[REDACTED]';
        if (item instanceof Error) return { name: item.name, message: item.message };
        if (typeof item === 'bigint') return item.toString();
        return item;
    }, 2);
}

/** One copyable server-console entry, before the HTTP error is normalized for the UI. */
export function logFetchFailure({ url, method, response, failure }: FetchDiagnostic): void {
    try {
        console.error([
            `[API HTTP] ${method.toUpperCase()} ${diagnosticUrl(url)} | status=${response?.status ?? 'SEM_RESPOSTA'} | etapa=${failure.stage}`,
            '1. RESPOSTA DA API (antes da validação do front-end)',
            printable(response ?? { status: null, rawData: null }),
            '2. CAUSA DO ERRO NO CLIENTE HTTP',
            printable(failure),
            '[/API HTTP]',
        ].join('\n'));
    } catch {
        // Diagnostics must never replace the original failure or affect the request flow.
    }
}
