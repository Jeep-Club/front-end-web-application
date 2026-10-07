import { authCookieOptions } from '@/utils/auth/cookieOptions';
import { getSigningSecret } from '@/services/token/secret';

describe('authentication in deployed environments', () => {
    const originalEnv = process.env;
    beforeEach(() => { process.env = { ...originalEnv }; });
    afterEach(() => { process.env = originalEnv; });

    it('requires HTTPS cookies in production even with NODE_SECURE=HTTP', () => {
        process.env = { ...process.env, NODE_ENV: 'production', NODE_SECURE: 'HTTP' };
        expect(authCookieOptions(true)).toMatchObject({ secure: true, httpOnly: true, sameSite: 'lax' });
    });

    it('supports HTTP for local development', () => {
        process.env = { ...process.env, NODE_ENV: 'development', NODE_SECURE: 'HTTP' };
        expect(authCookieOptions().secure).toBe(false);
    });

    it('supports HTTPS in development when explicitly configured', () => {
        process.env = { ...process.env, NODE_ENV: 'development', NODE_SECURE: 'HTTPS' };
        expect(authCookieOptions().secure).toBe(true);
    });

    it('rejects the public fallback signing key in production', () => {
        process.env = { ...process.env, NODE_ENV: 'production' };
        delete process.env.ACCESS;
        expect(() => getSigningSecret()).toThrow('ACCESS is required');
    });

    it('uses the configured private key', () => {
        process.env = { ...process.env, NODE_ENV: 'production', ACCESS: 'deployment-test-key' };
        expect(new TextDecoder().decode(getSigningSecret())).toBe('deployment-test-key');
    });
});
