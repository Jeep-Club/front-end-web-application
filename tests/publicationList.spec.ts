import { listAdminPublicationsAction } from '@/server/actions/publications/list';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { haveActionPermission } from '@/utils/permission/actionPermissions';
jest.mock('@/services/fetchWrapper/actionFetchWrapper', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/utils/permission/actionPermissions', () => ({ haveActionPermission: jest.fn() }));
beforeEach(() => jest.resetAllMocks());
it('consulta uma única página e preserva totais reais sem exigir EXPORT', async () => {
    jest.mocked(haveActionPermission).mockImplementation(async (_, action) => action === 'EVENT_READ_ADMIN');
    const page = { content: [], number: 2, size: 12, totalElements: 48, totalPages: 4, numberOfElements: 0, first: false, last: false, empty: true };
    jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 200, data: page });
    expect(await listAdminPublicationsAction({ page: 2, size: 12 })).toEqual(page);
    expect(actionFetchWrapper).toHaveBeenCalledTimes(1);
    expect(actionFetchWrapper).toHaveBeenCalledWith(expect.objectContaining({ url: 'admin/events?page=2&size=12&sort=id%2Cdesc' }));
    expect(haveActionPermission).toHaveBeenCalledTimes(1);
});
it('não consulta eventos sem permission e valida paginação', async () => {
    jest.mocked(haveActionPermission).mockResolvedValue(false);
    await expect(listAdminPublicationsAction({ page: 0, size: 12 })).rejects.toThrow('permissão');
    jest.mocked(haveActionPermission).mockResolvedValue(true);
    await expect(listAdminPublicationsAction({ page: -1, size: 51 })).rejects.toThrow();
    expect(actionFetchWrapper).not.toHaveBeenCalled();
});
it('aceita ordenação por início com desempate estável e rejeita campos arbitrários', async () => {
    jest.mocked(haveActionPermission).mockResolvedValue(true);
    jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 200, data: {} });
    await listAdminPublicationsAction({ page: 0, size: 12, sort: 'startsAt,asc' });
    expect(actionFetchWrapper).toHaveBeenLastCalledWith(expect.objectContaining({ url: 'admin/events?page=0&size=12&sort=startsAt%2Casc&sort=id%2Cdesc' }));
    jest.mocked(actionFetchWrapper).mockClear();
    await expect(listAdminPublicationsAction({ page: 0, size: 12, sort: 'title,desc' as 'id,desc' })).rejects.toThrow();
    expect(actionFetchWrapper).not.toHaveBeenCalled();
});
