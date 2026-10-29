jest.mock('server-only', () => ({}));
jest.mock('@/services/fetchWrapper/actionFetchWrapper', () => ({ __esModule: true, default: jest.fn() }));

import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { saveDependentWithPhotoAction, removeDependentPhotoAction } from '@/server/actions/dependents/photo';
import { dependentResponseSchema } from '@/schemas/dependents';
import { imageUploadErrorMessage } from '@/utils/media/uploadError';
import { fetchWrapper } from '@/services/fetchWrapper/fetchWrapper';
import { z } from 'zod';

const data = { name: 'Pessoa Dependente', cpf: '52998224725', birthDate: '2010-01-01', relationshipType: 'CHILD', phoneNumber: '11999999999' };
const saved = { ...data, id: 7, userId: 1, status: 'ACTIVE', createdAt: '2026-10-21T00:00:00Z', updatedAt: null, photoUrl: '/dependents/7/photo' };
const form = () => {
    const body = new FormData();
    body.set('dependent', JSON.stringify(data));
    body.set('photo', new File(['test-photo'], 'photo.png', { type: 'image/png' }));
    return body;
};
beforeEach(() => { jest.clearAllMocks(); jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 201, data: saved }); });

it('creates a dependent and private photo together without the global image upload', async () => {
    await expect(saveDependentWithPhotoAction(form())).resolves.toEqual(saved);
    const request = jest.mocked(actionFetchWrapper).mock.calls[0][0];
    expect(request.url).toBe('dependents');
    expect(request.method).toBe('POST');
    const body = request.body as FormData;
    const json = body.get('dependent') as Blob;
    expect(json.type).toBe('application/json');
    expect(JSON.parse(await json.text())).toEqual(data);
    expect((body.get('photo') as File).name).toBe('photo.png');
    expect(body.has('storageKey')).toBe(false);
    expect(actionFetchWrapper).toHaveBeenCalledTimes(1);
});

it('updates with multipart and removes photos only through the explicit delete route', async () => {
    await saveDependentWithPhotoAction(form(), 7);
    expect(actionFetchWrapper).toHaveBeenCalledWith(expect.objectContaining({ url: 'dependents/7', method: 'PUT' }));
    await removeDependentPhotoAction(7);
    expect(actionFetchWrapper).toHaveBeenLastCalledWith(expect.objectContaining({ url: 'dependents/7/photo', method: 'DELETE' }));
});

it('rejects an oversized photo before sending the request', async () => {
    const body = form();
    body.set('photo', new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' }));
    await expect(saveDependentWithPhotoAction(body)).rejects.toThrow('5 MiB');
    expect(actionFetchWrapper).not.toHaveBeenCalled();
});

it('accepts the protected photo URL and current dependent lifecycle states', () => {
    expect(dependentResponseSchema.parse(saved).photoUrl).toBe('/dependents/7/photo');
    expect(dependentResponseSchema.parse({ ...saved, status: 'INACTIVE' }).status).toBe('INACTIVE');
    expect(dependentResponseSchema.parse({ ...saved, status: 'ARCHIVED' }).status).toBe('ARCHIVED');
});

it('lets fetch generate the multipart boundary while preserving the authorization header', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    try {
        await fetchWrapper({ url: 'https://api.example/dependents', method: 'POST', body: form(), headers: { Authorization: 'Bearer test-only', 'Content-Type': 'application/json' }, schema: z.object({ ok: z.boolean() }) });
        const headers = new Headers(fetchSpy.mock.calls[0][1]?.headers);
        expect(headers.get('Content-Type')).toBeNull();
        expect(headers.get('Authorization')).toBe('Bearer test-only');
    } finally { fetchSpy.mockRestore(); }
});

it('explains oversized images even when the proxy sends HTML instead of JSON', () => {
    expect(imageUploadErrorMessage(413, '<html>too large</html>')).toContain('Reduza o arquivo');
    expect(imageUploadErrorMessage(400, { code: 'INVALID_IMAGE', status: 400, detail: 'Erro genérico' })).toContain('5 MiB');
    expect(imageUploadErrorMessage(403, { code: 'ACCESS_DENIED', status: 403, detail: 'Você não pode alterar esta foto.' })).toBe('Você não pode alterar esta foto.');
});
