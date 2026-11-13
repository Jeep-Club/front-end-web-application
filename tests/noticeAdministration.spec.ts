import { mutatePublishedPublicationAction } from '@/server/actions/publications/published';
import { getAdminNoticeAction, updateAdminNoticeAction } from '@/server/actions/publications/notices';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { haveActionPermission } from '@/utils/permission/actionPermissions';
jest.mock('@/services/fetchWrapper/actionFetchWrapper', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/utils/permission/actionPermissions', () => ({ haveActionPermission: jest.fn() }));
beforeEach(() => jest.resetAllMocks());
it('consulta aviso arquivado diretamente sem feed ou export', async () => {
    jest.mocked(haveActionPermission).mockResolvedValue(true);
    jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 200, data: { id: 7, status: 'ARCHIVED' } });
    expect(await getAdminNoticeAction(7)).toEqual({ id: 7, status: 'ARCHIVED' });
    expect(actionFetchWrapper).toHaveBeenCalledWith(expect.objectContaining({ url: 'admin/notices/7' }));
});
it('PATCH omite campos intactos e rejeita null/permission ausente', async () => {
    jest.mocked(haveActionPermission).mockImplementation(async (_, action) => action === 'NOTICE_UPDATE');
    jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 200, data: { id: 7 } });
    await updateAdminNoticeAction(7, { title: 'Novo' });
    expect(actionFetchWrapper).toHaveBeenCalledWith(expect.objectContaining({ method: 'PATCH', body: '{"title":"Novo"}' }));
    await expect(updateAdminNoticeAction(7, { title: null } as never)).rejects.toThrow();
    await expect(getAdminNoticeAction(7)).rejects.toThrow('permissão');
    expect(actionFetchWrapper).toHaveBeenCalledTimes(1);
});

it('exclui aviso arquivado sem impor publicação prévia e preserva erro 409', async () => {
    jest.mocked(haveActionPermission).mockResolvedValue(true);
    jest.mocked(actionFetchWrapper).mockResolvedValueOnce({ status: 200, data: { status: 'ARCHIVED' } }).mockResolvedValueOnce({ status: 204, data: undefined });
    await expect(mutatePublishedPublicationAction({ id: 7, type: 'NOTICE', action: 'delete' })).resolves.toEqual({ id: 7, type: 'NOTICE', action: 'delete' });
    expect(actionFetchWrapper).toHaveBeenLastCalledWith(expect.objectContaining({ url: 'admin/notices/7', method: 'DELETE' }));
});
