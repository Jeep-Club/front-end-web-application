import { z } from 'zod';
import { fetchWrapper } from '@/services/fetchWrapper/fetchWrapper';
import { identityMeResponseSchema } from '@/schemas/auth/me/me';

const originalFetch = global.fetch;
const mockFetch = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
let log: jest.SpyInstance;
const url = 'http://api.local/identity/me';
const schema = z.object({ email: z.string() });
const identity = {
    id: 9, name: 'Usuário de teste', birthDate: null, email: null, cpf: '00000000000',
    rg: null, phoneNumber: null, profilePhotoStorageKey: null, status: 'ACTIVE',
    createdAt: '2026-10-28T00:00:00Z', disabledAt: null, updatedAt: null,
};

beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
    log = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => { log.mockRestore(); global.fetch = originalFetch; });

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status, statusText: status === 200 ? 'OK' : 'Unauthorized', headers: { 'Content-Type': 'application/json' } });
}

it('reproduces the email:null mismatch and prints the raw 200 response before the Zod cause', async () => {
    mockFetch.mockResolvedValue(jsonResponse(identity));
    const error = await fetchWrapper({ url, schema: identityMeResponseSchema.extend({ email: z.string() }) }).catch(error => error);
    expect(error).toMatchObject({ status: 200, rawData: identity, zodError: expect.any(z.ZodError) });
    expect(log).toHaveBeenCalledTimes(1);
    const output = log.mock.calls[0][0] as string;
    expect(output).toContain('[API HTTP] GET http://api.local/identity/me | status=200 | etapa=ZOD_PARSE');
    expect(output).toContain('"email": null');
    expect(output).toContain('"expected": "string"');
    expect(output).toContain('"path": [\n        "email"');
    expect(output.indexOf('"rawData"')).toBeLessThan(output.indexOf('"issues"'));
});

it('distinguishes an API 401 from a local response-schema error without changing the rejected object', async () => {
    const rawData = { status: 401, code: 'PASSWORD_CHANGE_CHALLENGE_INVALID', detail: 'O desafio é inválido ou expirou.' };
    mockFetch.mockResolvedValue(jsonResponse(rawData, 401));
    await expect(fetchWrapper({ url, method: 'POST', schema })).rejects.toEqual({ rawData, status: 401 });
    const output = log.mock.calls[0][0] as string;
    expect(output).toContain('etapa=HTTP_STATUS');
    expect(output).toContain('PASSWORD_CHANGE_CHALLENGE_INVALID');
    expect(output).not.toContain('ZOD_PARSE');
});

it('identifies malformed JSON separately and preserves the original text', async () => {
    mockFetch.mockResolvedValue(new Response('{broken JSON', { headers: { 'Content-Type': 'application/json' } }));
    await expect(fetchWrapper({ url, schema })).rejects.toMatchObject({ status: 200, rawData: '{broken JSON' });
    expect(log.mock.calls[0][0]).toContain('etapa=JSON_PARSE');
    expect(log.mock.calls[0][0]).toContain('"name": "SyntaxError"');
});

it('prints network failure without pretending a response was received', async () => {
    const error = new TypeError('fetch failed');
    mockFetch.mockRejectedValue(error);
    await expect(fetchWrapper({ url, schema })).rejects.toBe(error);
    expect(log.mock.calls[0][0]).toContain('status=SEM_RESPOSTA | etapa=NETWORK');
    expect(log.mock.calls[0][0]).toContain('"status": null');
});

it('keeps tokens and request credentials out of the diagnostic without modifying rawData', async () => {
    const rawData = { email: null, accessToken: 'response-access-secret', nested: { refreshToken: 'response-refresh-secret' } };
    mockFetch.mockResolvedValue(jsonResponse(rawData));
    await expect(fetchWrapper({ url: `${url}?token=query-secret`, method: 'POST',
        headers: { Authorization: 'Bearer request-secret' }, body: JSON.stringify({ newPassword: 'password-secret' }), schema,
    })).rejects.toMatchObject({ rawData });
    const output = log.mock.calls[0][0] as string;
    expect(output).toContain('[REDACTED]');
    expect(output).not.toMatch(/response-access-secret|response-refresh-secret|query-secret|request-secret|password-secret/);
    expect(rawData.accessToken).toBe('response-access-secret');
});

it('does not log successful JSON, legacy text or 204 responses', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ email: 'test@example.test' }))
        .mockResolvedValueOnce(new Response('legacy text'))
        .mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(fetchWrapper({ url, schema })).resolves.toMatchObject({ data: { email: 'test@example.test' } });
    await expect(fetchWrapper({ url, schema: z.string() })).resolves.toMatchObject({ data: 'legacy text' });
    await expect(fetchWrapper({ url, schema })).resolves.toEqual({ status: 204, data: undefined });
    expect(log).not.toHaveBeenCalled();
});

it('a failed console write cannot replace the original HTTP error', async () => {
    log.mockImplementation(() => { throw new Error('logger failed'); });
    const rawData = { code: 'INVALID', status: 401 };
    mockFetch.mockResolvedValue(jsonResponse(rawData, 401));
    await expect(fetchWrapper({ url, schema })).rejects.toEqual({ rawData, status: 401 });
});
