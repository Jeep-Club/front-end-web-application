jest.mock('server-only', () => ({}));
import { frontendHeaders } from '@/services/fetchWrapper/frontendHeaders';

describe('private frontend server credential', () => {
    const originalEnv = process.env;
    beforeEach(() => { process.env = { ...originalEnv }; delete process.env.API_FRONTEND_KEY; });
    afterEach(() => { process.env = originalEnv; });

    it('fails closed in production without a private credential', () => {
        process.env = { ...process.env, NODE_ENV: 'production' };
        expect(() => frontendHeaders()).toThrow('API_FRONTEND_KEY is not configured');
    });

    it('preserves user authentication and overrides untrusted credentials', () => {
        process.env.API_FRONTEND_KEY = 'private-test-key';
        expect(frontendHeaders(new Headers({ Authorization: 'Bearer user-token', 'X-Frontend-Key': 'untrusted' })))
            .toEqual({ authorization: 'Bearer user-token', 'x-frontend-key': 'private-test-key' });
    });

    it('permits a local backend without the server access guard', () => {
        process.env = { ...process.env, NODE_ENV: 'development' };
        expect(frontendHeaders()).toEqual({});
    });
});
