import { getAdminServicePublicationAction, deleteAdminServicePublicationAction } from '@/server/actions/publications/services';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { haveActionPermission } from '@/utils/permission/actionPermissions';
jest.mock('@/services/fetchWrapper/actionFetchWrapper', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/utils/permission/actionPermissions', () => ({ haveActionPermission: jest.fn() }));
beforeEach(() => jest.resetAllMocks());
it('consulta serviço pelo Publication.id sem EXPORT ou ownership', async () => {
    jest.mocked(haveActionPermission).mockImplementation(async (_, action) => action === 'SERVICE_ADMIN_READ');
    jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 200, data: { id: 3, sourceRequestId: 80 } });
    expect(await getAdminServicePublicationAction(3)).toEqual({ id: 3, sourceRequestId: 80 });
    expect(actionFetchWrapper).toHaveBeenCalledWith(expect.objectContaining({ url: 'admin/services/3' }));
});
it('delete 204 não apaga pedido/proposta e não exige READ', async () => {
    jest.mocked(haveActionPermission).mockImplementation(async (_, action) => action === 'SERVICE_ADMIN_DELETE');
    jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 204, data: undefined });
    await expect(deleteAdminServicePublicationAction(3)).resolves.toEqual({ id: 3, type: 'SERVICE', action: 'delete' });
    expect(actionFetchWrapper).toHaveBeenCalledTimes(1);
    expect(actionFetchWrapper).toHaveBeenCalledWith(expect.objectContaining({ url: 'admin/services/3', method: 'DELETE' }));
});
