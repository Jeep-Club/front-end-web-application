import { toActionError } from '@/utils/http/apiError';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { listToolsAction } from '@/server/actions/tools/list';
import { getToolDetailAction } from '@/server/actions/tools/detail';
import { updateToolPhotoAction } from '@/server/actions/tools/photo';
import { updateToolPhotoAction as updatePhotoTransport } from '@/server/actions/tools/photo';
import { generateUserTemporaryPasswordAction, rejectMembershipApplicationAction } from '@/server/actions/admin/membership-applications';
import { HttpAPIRoutes } from '@/utils/http/api';

jest.mock('@/services/fetchWrapper/actionFetchWrapper', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/server/actions/tools/detail', () => ({ getToolDetailAction: jest.fn() }));

const request = jest.mocked(actionFetchWrapper);
const detail = jest.mocked(getToolDetailAction);
beforeEach(() => jest.resetAllMocks());

it('preserves photo compatibility reads on the server without modifying the API response', async () => {
    const content = [
        { id: 1, name: 'Macaco', status: 'ACTIVE' },
        { id: 2, name: 'Cinta', status: 'ACTIVE', photoStorageKey: null },
        { id: 3, name: 'Chave', status: 'ACTIVE', photoStorageKey: 'existing-photo' },
    ];
    request.mockResolvedValue({ status: 200, data: { content, totalElements: 3 } });
    detail.mockResolvedValue({ id: 1, name: 'Macaco', status: 'ACTIVE', description: '', userId: 1, photoStorageKey: 'detail-photo' });
    const result = await listToolsAction();
    expect(result.content[0].photoStorageKey).toBe('detail-photo');
    expect(result.content[1].photoStorageKey).toBeNull();
    expect(result.content[2].photoStorageKey).toBe('existing-photo');
    expect(detail).toHaveBeenCalledTimes(1);
    expect(detail).toHaveBeenCalledWith(1);
    expect(content[0]).not.toHaveProperty('photoStorageKey');
});

it('still lists tools if a compatibility detail read fails', async () => {
    request.mockResolvedValue({ status: 200, data: { content: [{ id: 1, name: 'Macaco', status: 'ACTIVE' }] } });
    detail.mockRejectedValue(new Error('Unavailable detail'));
    expect((await listToolsAction()).content).toHaveLength(1);
});

it('keeps photo errors serializable and exposes their message to the client adapter', async () => {
    const rawData = { code: 'ACCESS_DENIED', status: 403, detail: 'Você não pode alterar esta foto.' };
    request.mockRejectedValue(toActionError({ rawData, status: 403 }));
    await expect(updateToolPhotoAction(1, null)).rejects.toMatchObject({ status: 403, code: rawData.code });
    await expect(updateToolPhotoAction(1, null)).rejects.toThrow(rawData.detail);
});

it('keeps temporary password generation in the server implementation', async () => {
    const data = { userId: 12, temporaryPassword: 'test-only-password' };
    request.mockResolvedValue({ status: 200, data });
    await expect(generateUserTemporaryPasswordAction(12)).resolves.toEqual(data);
    expect(request).toHaveBeenCalledWith(expect.objectContaining({
        url: HttpAPIRoutes.ADMIN_USER_TEMPORARY_PASSWORD.replace('{userId}', '12'), method: 'POST',
    }));
});

it('preserves rejection with a blank optional reason', async () => {
    request.mockResolvedValue({ status: 204, data: '' });
    await expect(rejectMembershipApplicationAction(5, '  ')).resolves.toBeUndefined();
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ body: JSON.stringify({ reason: null }) }));
});
