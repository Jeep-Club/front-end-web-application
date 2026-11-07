import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import resetPasswordAction from '@/server/actions/auth/reset-password';
import { completeFirstAccessPasswordAction } from '@/server/actions/auth/complete-first-access-password';
import { HttpAPIRoutes } from '@/utils/http/api';
import { logout } from '@/utils/auth/logout';
import { ActionError } from '@/utils/http/ActionError';

const jar = { get: jest.fn(), set: jest.fn(), delete: jest.fn() };
jest.mock('next/headers', () => ({ cookies: jest.fn(async () => jar) }));
jest.mock('@/services/fetchWrapper/actionFetchWrapper', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/utils/auth/login', () => ({ login: jest.fn() }));
jest.mock('@/utils/auth/logout', () => ({ logout: jest.fn() }));
jest.mock('@/utils/auth/me', () => ({ me: jest.fn() }));
const http = jest.mocked(actionFetchWrapper);
beforeEach(() => { jest.clearAllMocks(); http.mockReset(); jar.get.mockImplementation(name => ({ value: name === 'FirstAccessPasswordChangeToken' ? 'one-use-challenge' : 'true' })); });

it('resets through the real route and sends only the request contract fields', async () => {
    http.mockResolvedValue({ status: 204, data: undefined });
    await expect(resetPasswordAction({ token: 'recovery-token', password: 'ValidPass123!', confirmPassword: 'ValidPass123!' })).resolves.toEqual({ success: true });
    expect(http).toHaveBeenCalledWith(expect.objectContaining({ url: 'authentication/password-recovery/requests/token/reset', method: 'POST', body: JSON.stringify({ token: 'recovery-token', newPassword: 'ValidPass123!' }) }));
});

it('does not report fake success when password recovery rejects the token', async () => {
    const failure = new ActionError('Token já utilizado.', { status: 401, code: 'PASSWORD_RESET_TOKEN_INVALID' });
    http.mockRejectedValue(failure);
    await expect(resetPasswordAction({ token: 'used', password: 'ValidPass123!', confirmPassword: 'ValidPass123!' })).rejects.toBe(failure);
});

it('consumes first-access cookies as soon as password change succeeds, even if identity hydration fails', async () => {
    const failure = new ActionError('Consulta indisponível.', { status: 503 });
    http.mockImplementation(async props => {
        if (props.url === HttpAPIRoutes.COMPLETE_REQUIRED_PASSWORD_CHANGE) return { status: 200, data: { accessToken: 'access', refreshToken: 'refresh', expiresInSeconds: 60 } };
        expect(jar.delete).toHaveBeenCalledWith('FirstAccessPasswordChangeToken');
        expect(jar.delete).toHaveBeenCalledWith('FirstAccessPasswordChangePending');
        throw failure;
    });
    await expect(completeFirstAccessPasswordAction({ password: 'ValidPass123!', confirmPassword: 'ValidPass123!' })).rejects.toBe(failure);
    expect(logout).toHaveBeenCalledTimes(1);
});

it('keeps the challenge retryable when the password mutation itself failed', async () => {
    http.mockRejectedValue(new ActionError('Tente uma senha diferente.', { status: 400 }));
    await expect(completeFirstAccessPasswordAction({ password: 'ValidPass123!', confirmPassword: 'ValidPass123!' })).rejects.toThrow('Tente uma senha diferente.');
    expect(jar.delete).not.toHaveBeenCalled();
});
