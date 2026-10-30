import { getAdminEventAction, updateAdminEventAction } from '@/server/actions/publications/events';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { haveActionPermission } from '@/utils/permission/actionPermissions';
jest.mock('@/services/fetchWrapper/actionFetchWrapper', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/utils/permission/actionPermissions', () => ({ haveActionPermission: jest.fn() }));
beforeEach(() => jest.resetAllMocks());
it('lê o detalhe administrativo sem usar feed ou Membership', async () => {
    jest.mocked(haveActionPermission).mockResolvedValue(true);
    jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 200, data: { id: 7 } });
    expect(await getAdminEventAction(7)).toEqual({ id: 7 });
    expect(actionFetchWrapper).toHaveBeenCalledWith(expect.objectContaining({ url: 'admin/events/7', method: 'GET', cache: 'no-store' }));
    expect(haveActionPermission).toHaveBeenCalledWith('PUBLICATIONS', 'EVENT_READ_ADMIN');
});
it('não consulta ID inválido ou sem acesso', async () => {
    await expect(getAdminEventAction(0)).rejects.toThrow();
    jest.mocked(haveActionPermission).mockResolvedValue(false);
    await expect(getAdminEventAction(7)).rejects.toThrow('permissão');
    expect(actionFetchWrapper).not.toHaveBeenCalled();
});
it('envia PATCH editorial sem agenda e preserva null explícito', async () => {
    jest.mocked(haveActionPermission).mockImplementation(async (_, action) => action === 'EVENT_UPDATE');
    jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 200, data: { id: 7 } });
    await updateAdminEventAction(7, { title: 'Novo' });
    expect(actionFetchWrapper).toHaveBeenLastCalledWith(expect.objectContaining({ method: 'PATCH', body: '{"title":"Novo"}' }));
    await updateAdminEventAction(7, { endsAt: null });
    expect(actionFetchWrapper).toHaveBeenLastCalledWith(expect.objectContaining({ body: '{"endsAt":null}' }));
    expect(haveActionPermission).not.toHaveBeenCalledWith('PUBLICATIONS', 'EVENT_READ_ADMIN');
});
it('substitui a coleção inteira e permite remoção explícita com []', async () => {
    jest.mocked(haveActionPermission).mockResolvedValue(true);
    jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 200, data: { id: 7 } });
    const charges = [{ chargeDefinitionId: 1 }, { chargeDefinitionId: 2 }];
    await updateAdminEventAction(7, { charges });
    expect(actionFetchWrapper).toHaveBeenLastCalledWith(expect.objectContaining({ body: JSON.stringify({ charges }) }));
    await updateAdminEventAction(7, { charges: [] });
    expect(actionFetchWrapper).toHaveBeenLastCalledWith(expect.objectContaining({ body: '{"charges":[]}' }));
});
