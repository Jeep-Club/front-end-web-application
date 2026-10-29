import { ActionError, getActionFailure } from '@/utils/http/ActionError';
import { extractApiErrorMessage, SESSION_EXPIRED_MESSAGE, toActionError } from '@/utils/http/apiError';
import { mutationErrorHandler } from '@/providers/QueryProvider/handlers/mutation/onError';
import { queryErrorHandler } from '@/providers/QueryProvider/handlers/query/onError';
import { QueryClient, MutationCache, QueryCache } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { saveMedicalProfileAction } from '@/server/actions/profile/medical-profile';

jest.mock('react-hot-toast', () => ({ toast: { error: jest.fn() } }));
jest.mock('@/services/fetchWrapper/actionFetchWrapper', () => ({ __esModule: true, default: jest.fn() }));
const problem = { code: 'CONFLICT', status: 409, detail: 'Este cadastro já existe.' };
const redacted = (error: ActionError) => Object.assign(new Error('An error occurred in the Server Components render.'), { digest: error.digest });
beforeEach(() => jest.clearAllMocks());

it('preserves backend detail and prioritizes field validation messages', () => {
    expect(extractApiErrorMessage({ rawData: problem }, 'fallback')).toBe(problem.detail);
    expect(extractApiErrorMessage({ rawData: { ...problem, errors: [{ field: 'cpf', code: 'INVALID', message: 'Informe um CPF válido.' }] } }, 'fallback')).toBe('Informe um CPF válido.');
});

it('the action propagates the HTTP error unchanged without an adapter or result envelope', async () => {
    const failure = toActionError({ rawData: problem, status: 409 });
    jest.mocked(actionFetchWrapper).mockRejectedValue(failure);
    await expect(saveMedicalProfileAction({} as MedicalProfileRequest)).rejects.toBe(failure);
});

it('only public fields survive production error transport', () => {
    const failure = new ActionError(problem.detail, { code: problem.code, status: 409, cause: { rawData: 'private server response', stack: 'server paths' }, errors: [{ field: 'cpf', code: 'INVALID', message: 'Confira o CPF.' }] });
    const transported = redacted(failure);
    expect(getActionFailure(transported)).toEqual({ message: problem.detail, code: 'CONFLICT', status: 409, errors: [{ field: 'cpf', code: 'INVALID', message: 'Confira o CPF.' }] });
    expect(decodeURIComponent(failure.digest)).not.toMatch(/private server response|server paths|rawData|cause/);
});

it('a global mutation handler restores metadata before the local callback and emits one toast', async () => {
    const client = new QueryClient({ mutationCache: new MutationCache({ onError: mutationErrorHandler }) });
    const failure = redacted(toActionError({ rawData: problem, status: 409 }));
    const local = jest.fn((error: Error) => expect(error.message).toBe(problem.detail));
    const mutation = client.getMutationCache().build(client, { mutationFn: async () => { throw failure; }, onError: local, retry: false });
    await expect(mutation.execute(undefined)).rejects.toBe(failure);
    expect(failure).toMatchObject({ message: problem.detail, code: 'CONFLICT', status: 409 });
    expect(local).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(problem.detail);
    client.clear();
});

it('a global query handler restores the message used by query.error and its toast', async () => {
    const client = new QueryClient({ queryCache: new QueryCache({ onError: queryErrorHandler }), defaultOptions: { queries: { retry: false } } });
    const failure = redacted(toActionError({ rawData: problem, status: 409 }));
    await expect(client.fetchQuery({ queryKey: ['contract'], queryFn: async () => { throw failure; } })).rejects.toBe(failure);
    expect(client.getQueryState(['contract'])?.error).toMatchObject({ message: problem.detail, status: 409 });
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(problem.detail);
    client.clear();
});

it('session expiration survives native error redaction', () => {
    const failure = redacted(toActionError(new Error(SESSION_EXPIRED_MESSAGE)));
    expect(getActionFailure(failure)).toMatchObject({ code: 'SESSION_EXPIRED', status: 401, message: SESSION_EXPIRED_MESSAGE });
});

it('partial-save context preserves API metadata and cannot hide an expired session', () => {
    const permission = redacted(toActionError({ rawData: { ...problem, status: 403, code: 'ACCESS_DENIED' }, status: 403 }));
    expect(getActionFailure(new ActionError('Dados salvos, mas a foto não.', { cause: permission }))).toMatchObject({ status: 403, code: 'ACCESS_DENIED', message: `Dados salvos, mas a foto não. ${problem.detail}` });
    const expired = redacted(toActionError(new Error(SESSION_EXPIRED_MESSAGE)));
    expect(getActionFailure(new ActionError('Foto não salva.', { cause: expired }))).toMatchObject({ status: 401, code: 'SESSION_EXPIRED', message: SESSION_EXPIRED_MESSAGE });
});

it.each(['12345', 'NEXT_REDIRECT;replace;/login;307;', 'JEEP_API_ERROR_V1:%', 'JEEP_API_ERROR_V1:%7B%22message%22%3A42%7D'])('ignores opaque or malformed digest %s', digest => {
    expect(getActionFailure(Object.assign(new Error('private'), { digest }))).toBeUndefined();
});

it('does not expose unexpected exception details or environment variable names', () => {
    expect(extractApiErrorMessage(new Error('private connection credentials'), 'safe fallback')).toBe('safe fallback');
    const failure = new ActionError('API_FRONTEND_KEY is not configured');
    expect(decodeURIComponent(failure.digest)).not.toContain('API_FRONTEND_KEY');
});
