import { z } from 'zod';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { getAuthCookies } from '@/utils/auth/get';
import refresh from '@/utils/auth/refresh';
import { login } from '@/utils/auth/login';
import { ActionError } from '@/utils/http/ActionError';
import { mutationErrorHandler } from '@/providers/QueryProvider/handlers/mutation/onError';
import { toast } from 'react-hot-toast';

jest.mock('@/utils/auth/get', () => ({ getAuthCookies: { SERVER: jest.fn() } }));
jest.mock('@/services/fetchWrapper/frontendHeaders', () => ({ frontendHeaders: (headers: HeadersInit) => Object.fromEntries(new Headers(headers)) }));
jest.mock('@/utils/auth/refresh', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/utils/auth/login', () => ({ login: jest.fn() }));
jest.mock('react-hot-toast', () => ({ toast: { error: jest.fn() } }));

const originalFetch = global.fetch;
const mockFetch = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
const problem = (status: number, code: string, detail = 'Corrija os dados e tente novamente.') => ({ status, code, detail });
const response = (status: number, body: unknown, contentType = 'application/problem+json') => new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { 'Content-Type': contentType } });
const request = () => actionFetchWrapper({ url: 'resource', schema: z.object({ id: z.number() }) });

beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = mockFetch;
    process.env.API_URL = 'http://api.local';
    jest.mocked(getAuthCookies.SERVER).mockResolvedValue({ AuthAccessToken: 'old', AuthRefreshToken: 'refresh', AccessTokenExpiration: '2030-01-01' });
});
afterAll(() => { global.fetch = originalFetch; });

it('returns 204 without reading a body or invoking a JSON schema', async () => {
    const res = response(204, undefined);
    const read = jest.spyOn(res, 'text');
    mockFetch.mockResolvedValue(res);
    await expect(request()).resolves.toEqual({ status: 204, data: undefined });
    expect(read).not.toHaveBeenCalled();
});

it('retains the existing JSON validation and request headers', async () => {
    mockFetch.mockResolvedValue(response(200, { id: 42, extra: 'removed' }, 'application/json'));
    await expect(request()).resolves.toEqual({ status: 200, data: { id: 42 } });
    const headers = new Headers(mockFetch.mock.calls[0][1]?.headers);
    expect(headers.get('Authorization')).toBe('Bearer old');
    expect(headers.get('Accept-Language')).toBe('pt-BR');
});

it.each([[402, 'MEMBERSHIP_PAYMENT_REQUIRED'], [403, 'ACCESS_DENIED'], [409, 'CONFLICT'], [503, 'MEMBERSHIP_CHARGE_UNAVAILABLE'], [401, 'INVALID_CREDENTIALS']])('preserves %s %s through action serialization and the global toast', async (status, code) => {
    const errors = [{ field: 'cpf', code: 'INVALID', message: 'Informe um CPF válido.' }];
    mockFetch.mockResolvedValue(response(status, { ...problem(status, code), errors }));
    const error = await request().catch(error => error);
    expect(error).toBeInstanceOf(ActionError);
    expect(error).toMatchObject({ status, code, errors, message: errors[0].message });
    mutationErrorHandler(error as Error);
    expect(toast.error).toHaveBeenCalledWith(errors[0].message);
    expect(refresh).not.toHaveBeenCalled();
    expect(login).not.toHaveBeenCalled();
});

it.each([402, 403, 409, 503])('does not convert a %s after refresh into session expiration', async status => {
    mockFetch.mockResolvedValueOnce(response(401, problem(401, 'INVALID_ACCESS_TOKEN'))).mockResolvedValueOnce(response(status, problem(status, 'BUSINESS_FAILURE')));
    jest.mocked(refresh).mockResolvedValue({ accessToken: 'new', refreshToken: 'new-refresh', expiresInSeconds: 60 });
    await expect(request()).rejects.toMatchObject({ status, code: 'BUSINESS_FAILURE' });
    expect(new Headers(mockFetch.mock.calls[1][1]?.headers).get('authorization')).toBe('Bearer new');
    expect(refresh).toHaveBeenCalledTimes(1);
});

it('keeps the session when refreshing fails due to an outage', async () => {
    mockFetch.mockResolvedValue(response(401, problem(401, 'INVALID_ACCESS_TOKEN')));
    jest.mocked(refresh).mockRejectedValue({ status: 503, rawData: problem(503, 'SERVICE_UNAVAILABLE') });
    await expect(request()).rejects.toMatchObject({ status: 503, code: 'SERVICE_UNAVAILABLE' });
});

it('expires the session when the refresh token is rejected', async () => {
    mockFetch.mockResolvedValue(response(401, problem(401, 'INVALID_ACCESS_TOKEN')));
    jest.mocked(refresh).mockRejectedValue({ status: 401, rawData: problem(401, 'REFRESH_TOKEN_INVALID') });
    await expect(request()).rejects.toMatchObject({ code: 'SESSION_EXPIRED' });
});

it.each(['text/csv; charset=UTF-8', 'application/pdf'])('downloads validated %s bytes', async contentType => {
    mockFetch.mockResolvedValue(new Response('file bytes', { headers: { 'Content-Type': contentType } }));
    const { data } = await actionFetchWrapper({ url: 'export', responseType: 'blob', allowedContentTypes: ['text/csv', 'application/pdf'], schema: z.instanceof(Blob) });
    expect(await data.text()).toBe('file bytes');
});

it.each([400, 200])('surfaces JSON errors with HTTP %s instead of downloading them', async status => {
    mockFetch.mockResolvedValue(response(status, problem(400, 'VALIDATION_ERROR', 'Escolha um período válido.')));
    await expect(actionFetchWrapper({ url: 'export', responseType: 'blob', allowedContentTypes: ['application/pdf'], schema: z.instanceof(Blob) })).rejects.toMatchObject({ message: 'Escolha um período válido.' });
});

it.each(['text/html', 'application/octet-stream', ''])('rejects unexpected binary Content-Type %s', async contentType => {
    mockFetch.mockResolvedValue(new Response('not a PDF', { headers: { 'Content-Type': contentType } }));
    await expect(actionFetchWrapper({ url: 'export', responseType: 'blob', allowedContentTypes: ['application/pdf'], schema: z.instanceof(Blob) })).rejects.toBeInstanceOf(ActionError);
});

it('does not set JSON Content-Type on multipart requests', async () => {
    mockFetch.mockResolvedValue(response(200, { id: 1 }, 'application/json'));
    await actionFetchWrapper({ url: 'upload', method: 'POST', body: new FormData(), schema: z.object({ id: z.number() }) });
    expect(new Headers(mockFetch.mock.calls[0][1]?.headers).has('Content-Type')).toBe(false);
});

it('does not leak schema diagnostics, HTML or network infrastructure details', async () => {
    mockFetch.mockResolvedValue(response(200, { wrong: true }, 'application/json'));
    await expect(request()).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
    mockFetch.mockRejectedValue(new TypeError('fetch failed: internal-host'));
    const failure = await request().catch(error => error as ActionError);
    if (!(failure instanceof ActionError)) throw new Error('Expected an HTTP failure');
    expect(decodeURIComponent(failure.digest)).not.toContain('internal-host');
    expect(failure).toMatchObject({ message: expect.stringContaining('conectar ao servidor') });
});
