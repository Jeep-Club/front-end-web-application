import { captureAction } from '@/utils/actions/captureAction';
import { ActionError, unwrapActionResult } from '@/utils/actions/actionResult';
import { extractApiErrorMessage, SESSION_EXPIRED_MESSAGE } from '@/utils/http/apiError';
import { mutationErrorHandler } from '@/providers/QueryProvider/handlers/mutation/onError';
import { toast } from 'react-hot-toast';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { saveMedicalProfileAction } from '@/actions/profile/medical-profile';
import { saveMedicalProfileAction as saveMedicalProfileTransport } from '@/server/actions/profile/medical-profile';
import { z } from 'zod';

jest.mock('react-hot-toast', () => ({ toast: { error: jest.fn() } }));
jest.mock('@/services/fetchWrapper/actionFetchWrapper', () => ({ __esModule: true, default: jest.fn() }));

const problem = {
    code: 'CONFLICT', status: 409, detail: 'Este cadastro já existe.',
    title: 'Conflito', timestamp: '2026-10-21T00:00:00Z',
};

beforeEach(() => jest.clearAllMocks());

it('preserves backend detail instead of replacing it with a generic code message', () => {
    expect(extractApiErrorMessage({ rawData: problem }, 'fallback')).toBe(problem.detail);
});

it('prioritizes the backend field validation message', () => {
    expect(extractApiErrorMessage({ rawData: { ...problem, errors: [
        { field: 'cpf', code: 'INVALID', message: 'Informe um CPF válido.' },
    ] } }, 'fallback')).toBe('Informe um CPF válido.');
});

it('transports a real action failure as plain JSON and reconstructs it only in the caller', async () => {
    jest.mocked(actionFetchWrapper).mockRejectedValue({ rawData: problem, status: 409 });
    const result = await saveMedicalProfileTransport({} as MedicalProfileRequest);
    expect(result).toEqual({ ok: false, error: {
        message: problem.detail, code: 'CONFLICT', status: 409, errors: undefined,
    } });
    const serialized = JSON.parse(JSON.stringify(result));
    expect(() => unwrapActionResult(serialized)).toThrow(problem.detail);
    await expect(saveMedicalProfileAction({} as MedicalProfileRequest)).rejects.toThrow(problem.detail);
});

it('preserves successful values including null, void and an existing ok:false application result', async () => {
    for (const value of [null, undefined, { ok: false, message: 'Confira os dados.' }, { id: 1 }]) {
        expect(unwrapActionResult(await captureAction(async () => value))).toEqual(value);
    }
});

it('preserves session expiration through serialization and nested action handlers', async () => {
    const result = await captureAction(async () => { throw new ActionError(SESSION_EXPIRED_MESSAGE); });
    expect(result).toMatchObject({ ok: false, error: { code: 'SESSION_EXPIRED', message: SESSION_EXPIRED_MESSAGE } });
    expect(() => unwrapActionResult(JSON.parse(JSON.stringify(result)))).toThrow(SESSION_EXPIRED_MESSAGE);
});

it('does not expose unexpected exception details or raw Zod diagnostics', async () => {
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
        const result = await captureAction(async () => { throw new Error('private connection credentials'); });
        expect(JSON.stringify(result)).not.toContain('private connection credentials');
        expect(result).toMatchObject({ ok: false, error: { code: 'UNEXPECTED_ERROR' } });
        const validation = await captureAction(async () => z.number().parse('invalid'));
        expect(validation).toMatchObject({ ok: false, error: { code: 'VALIDATION_ERROR' } });
    } finally { log.mockRestore(); }
});

it('keeps framework redirects out of the error envelope', async () => {
    const redirect = Object.assign(new Error('NEXT_REDIRECT'), { digest: 'NEXT_REDIRECT;replace;/login;307;' });
    await expect(captureAction(async () => { throw redirect; })).rejects.toBe(redirect);
});

it('does not display a second global toast when a mutation has a local handler', () => {
    mutationErrorHandler(new ActionError(problem.detail), true);
    expect(toast.error).not.toHaveBeenCalled();
    mutationErrorHandler(new ActionError(problem.detail));
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(problem.detail);
});

it('does not expose missing environment variable names to users', async () => {
    const result = await captureAction(async () => { throw new ActionError('API_FRONTEND_KEY is not configured'); });
    expect(JSON.stringify(result)).not.toContain('API_FRONTEND_KEY');
});
