jest.mock('server-only', () => ({}));
jest.mock('@/utils/auth/get', () => ({ getAuthCookies: { SERVER: jest.fn() } }));
jest.mock('@/utils/auth/refresh', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/utils/auth/login', () => ({ login: jest.fn() }));

import { GET } from '@/app/api/dependents/[id]/photo/route';
import { getAuthCookies } from '@/utils/auth/get';
import fetchRefreshToken from '@/utils/auth/refresh';

const env = process.env;
beforeEach(() => {
    process.env = { ...env, API_URL: 'https://api.example', API_FRONTEND_KEY: 'private-test-key' };
    jest.mocked(getAuthCookies.SERVER).mockResolvedValue({ AuthAccessToken: 'test-access', AuthRefreshToken: 'test-refresh', AccessTokenExpiration: '2099-01-01T00:00:00Z' });
});
afterEach(() => { process.env = env; jest.restoreAllMocks(); jest.clearAllMocks(); });
const request = () => new Request('http://localhost/api/dependents/7/photo');
const context = (id = '7') => ({ params: Promise.resolve({ id }) });

it('proxies only the ID-based private endpoint with credentials and no caching', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('image-bytes', { headers: { 'Content-Type': 'image/png' } }));
    const response = await GET(request(), context());
    expect(fetchSpy).toHaveBeenCalledWith('https://api.example/dependents/7/photo', expect.objectContaining({ cache: 'no-store' }));
    const headers = new Headers(fetchSpy.mock.calls[0][1]?.headers);
    expect(headers.get('Authorization')).toBe('Bearer test-access');
    expect(headers.get('x-frontend-key')).toBe('private-test-key');
    expect(response.headers.get('Cache-Control')).toContain('no-store');
    expect(response.headers.get('Vary')).toBe('Cookie');
    expect(await response.text()).toBe('image-bytes');
});

it('does not contact the backend for an invalid ID or anonymous visitor', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch');
    expect((await GET(request(), context('../other'))).status).toBe(400);
    jest.mocked(getAuthCookies.SERVER).mockResolvedValue(null);
    expect((await GET(request(), context())).status).toBe(401);
    expect(fetchSpy).not.toHaveBeenCalled();
});

it('renews expired authentication once and refuses non-image responses', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(null, { status: 401 })).mockResolvedValueOnce(new Response('<html>error</html>', { headers: { 'Content-Type': 'text/html' } }));
    jest.mocked(fetchRefreshToken).mockResolvedValue({ accessToken: 'new-access', refreshToken: 'new-refresh', expiresInSeconds: 3600 });
    expect((await GET(request(), context())).status).toBe(502);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(new Headers(fetchSpy.mock.calls[1][1]?.headers).get('Authorization')).toBe('Bearer new-access');
});
