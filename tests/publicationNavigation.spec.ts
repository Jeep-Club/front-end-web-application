import { haveRoutePermissions } from '@/utils/permission/routePermissions';
import { verifyPermissions } from '@/services/token/permissions';
import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { invalidatePublicationAdministration } from '@/utils/publications/administration';
jest.mock('@/services/token/permissions', () => ({ verifyPermissions: jest.fn() }));
it.each([
    ['EVENT_CREATE', '/admin/publications', true],
    ['EVENT_CREATE', '/admin/publications/event', true],
    ['NOTICE_CREATE', '/admin/publications/notice', true],
    ['NOTICE_READ', '/admin/publications/notice', true],
    ['SERVICE_REQUEST_CREATE', '/admin/publications/service', true],
    ['SERVICE_REQUEST_ADMIN_READ', '/admin/publications/service', true],
    ['EVENT_CREATE', '/admin/publications/notice', false],
    ['NOTICE_READ', '/admin/publications/event', false],
    ['NOTICE_READ', '/admin/publications/service', false],
    ['EVENT_CREATE', '/admin/publications/event/7', false],
    ['NOTICE_READ', '/admin/publications/event/7', false],
    ['NOTICE_READ', '/admin/publications/notice/8', true],
    ['SERVICE_REQUEST_ADMIN_READ', '/admin/publications', true],
    ['SERVICE_REQUEST_ADMIN_READ', '/admin/publications/service/9', false],
    ['SERVICE_ADMIN_READ', '/admin/publications/service/9', true],
    ['', '/admin/publications', false],
])('aplica acesso isolado de %s em %s', async (action, pathname, expected) => {
    jest.mocked(verifyPermissions).mockResolvedValue([{ module: 'PUBLICATIONS', actions: action ? [action] : [] }]);
    expect(await haveRoutePermissions({ pathname, permissionsToken: 'synthetic', onCatch: () => new Error('Invalid') })).toBe(expected);
});
it('invalida shapes distintos e preserva proposta após excluir serviço', async () => {
    const client = new QueryClient();
    const keys = [['publications', 'admin', 'services', 'detail', 9], ['publications', 'detail', 9], ['publications', 'feed', 'infinite'], ['publications', 'service-publication-change-requests', 'detail', 10], ['billing', 'dashboard']];
    for (const key of keys) client.setQueryData(key, { id: key.at(-1) });
    await invalidatePublicationAdministration(client, 'SERVICE', 9, { deleted: true });
    expect(client.getQueryData(keys[0])).toBeUndefined();
    expect(client.getQueryData(keys[1])).toBeUndefined();
    expect(client.getQueryState(keys[2])?.isInvalidated).toBe(true);
    expect(client.getQueryState(keys[3])?.isInvalidated).toBe(true);
    expect(client.getQueryData(keys[3])).toEqual({ id: 10 });
    expect(client.getQueryState(keys[4])?.isInvalidated).toBe(false);
    await invalidatePublicationAdministration(client, 'EVENT', 7, { billing: true });
    expect(client.getQueryState(keys[4])?.isInvalidated).toBe(true);
    client.clear();
});
it('não recria detalhe ativo excluído enquanto a navegação está pendente', async () => {
    const client = new QueryClient();
    const key = ['publications', 'admin', 'services', 'detail', 9];
    const read = jest.fn().mockResolvedValue({ id: 9 });
    client.setQueryData(key, { id: 9 });
    const observer = new QueryObserver(client, { queryKey: key, queryFn: read, staleTime: Infinity });
    const unsubscribe = observer.subscribe(() => {});
    await invalidatePublicationAdministration(client, 'SERVICE', 9, { deleted: true });
    expect(read).not.toHaveBeenCalled();
    expect(observer.getCurrentResult().data).toBeNull();
    unsubscribe(); client.clear();
});
