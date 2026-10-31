import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { haveActionPermission } from '@/utils/permission/actionPermissions';
import { getMedicalOwnerAction } from '@/server/actions/admin/medical-profile/manage';

jest.mock('@/services/fetchWrapper/actionFetchWrapper', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/utils/permission/actionPermissions', () => ({ haveActionPermission: jest.fn() }));
const request = jest.mocked(actionFetchWrapper);
const permission = jest.mocked(haveActionPermission);
beforeEach(() => jest.resetAllMocks());

it('reads the owner from existing identity routes only when that permission is granted', async () => {
    permission.mockResolvedValue(true);
    request.mockResolvedValueOnce({ status: 200, data: { ownerType: 'USER', ownerId: 10 } }).mockResolvedValueOnce({ status: 200, data: { name: 'Membro' } });
    await expect(getMedicalOwnerAction(1)).resolves.toEqual({ name: 'Membro', responsibleName: null });
    expect(request.mock.calls.map(([props]) => props.url)).toEqual(['admin/medical-profiles/1', 'identity/admin/users/10']);
});

it('does not turn medical-read permission into implicit identity-read permission', async () => {
    permission.mockImplementation(async module => module === 'HEALTH');
    request.mockResolvedValue({ status: 200, data: { ownerType: 'USER', ownerId: 10 } });
    await expect(getMedicalOwnerAction(1)).resolves.toEqual({ name: null, responsibleName: null });
    expect(request).toHaveBeenCalledTimes(1);
});

it('uses the dependent ID fallback instead of inventing a global dependent lookup route', async () => {
    permission.mockResolvedValue(true);
    request.mockResolvedValue({ status: 200, data: { ownerType: 'DEPENDENT', ownerId: 20 } });
    await expect(getMedicalOwnerAction(1)).resolves.toEqual({ name: null, responsibleName: null });
    expect(request).toHaveBeenCalledTimes(1);
});
