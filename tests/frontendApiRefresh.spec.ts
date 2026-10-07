jest.mock('server-only', () => ({}));
jest.mock('@/utils/auth/get', () => ({ getAuthCookies: { SERVER: jest.fn() } }));
jest.mock('@/services/fetchWrapper/fetchWrapper', () => ({ fetchWrapper: jest.fn() }));
jest.mock('@/utils/auth/refresh', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/utils/auth/login', () => ({ login: jest.fn() }));
import { getAuthCookies } from '@/utils/auth/get';
import { fetchWrapper } from '@/services/fetchWrapper/fetchWrapper';
import fetchRefreshToken from '@/utils/auth/refresh';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import z from 'zod';

describe('private API access when refreshing user authentication', () => {
    const env = process.env;
    afterEach(() => { process.env = env; jest.resetAllMocks(); });
    it('replaces the expired bearer token and retains the private credential on retry', async () => {
        process.env = { ...env, API_URL: 'https://backend.example', API_FRONTEND_KEY: 'private-test-key' };
        jest.mocked(getAuthCookies.SERVER).mockResolvedValue({ AuthAccessToken: 'old-token', AuthRefreshToken: 'refresh-token' } as Awaited<ReturnType<typeof getAuthCookies.SERVER>>);
        jest.mocked(fetchWrapper).mockRejectedValueOnce({ status: 401, rawData: {
            status: 401, code: 'INVALID_ACCESS_TOKEN', detail: 'Expired token',
        } }).mockResolvedValueOnce({ status: 200, data: {} });
        jest.mocked(fetchRefreshToken).mockResolvedValue({ accessToken: 'new-token', refreshToken: 'new-refresh', expiresInSeconds: 3600 } as Awaited<ReturnType<typeof fetchRefreshToken>>);
        await actionFetchWrapper({ url: 'identity/me', schema: z.object({}) });
        const retry = jest.mocked(fetchWrapper).mock.calls[1][0];
        const headers = new Headers(retry.headers);
        expect(headers.get('Authorization')).toBe('Bearer new-token');
        expect(headers.get('X-Frontend-Key')).toBe('private-test-key');
    });
});
