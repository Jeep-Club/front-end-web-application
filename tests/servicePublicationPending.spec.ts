import { listAdminPublicationsAction } from '@/actions/publications/list';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { haveActionPermission } from '@/utils/permission/actionPermissions';
import { maskServiceAmount } from '@/utils/masks/maskServiceAmount';
import { unMaskPhoneNumber } from '@/utils/masks/maskPhoneNumber';

jest.mock('@/services/fetchWrapper/actionFetchWrapper', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/utils/permission/actionPermissions', () => ({ haveActionPermission: jest.fn() }));
beforeEach(() => jest.resetAllMocks());

it('shows pending service requests to reviewers without requiring service export permissions', async () => {
    jest.mocked(haveActionPermission).mockImplementation(async (_, action) => action === 'SERVICE_REQUEST_ADMIN_READ');
    const request = { id: 11, title: 'Serviço enviado', content: 'Descrição', status: 'PENDING', images: [] };
    jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 200, data: { content: [request], last: true } });
    const page = await listAdminPublicationsAction({ types: ['SERVICE'], status: 'ALL', page: 0, size: 12 });
    expect(page.content).toEqual([{ ...request, type: 'SERVICE', serviceRequest: true }]);
    expect(page.totalElements).toBe(1);
    expect(actionFetchWrapper).toHaveBeenCalledWith(expect.objectContaining({ url: 'admin/service-publication-requests?status=PENDING&page=0&size=48&sort=requestedAt,desc' }));
    expect(actionFetchWrapper).toHaveBeenCalledTimes(1);
});

it('keeps pending requests out of the published filter', async () => {
    jest.mocked(haveActionPermission).mockImplementation(async (_, action) => action === 'SERVICE_REQUEST_ADMIN_READ');
    const page = await listAdminPublicationsAction({ types: ['SERVICE'], status: 'PUBLISHED', page: 0, size: 12 });
    expect(page.content).toEqual([]);
    expect(actionFetchWrapper).not.toHaveBeenCalled();
});

it('does not retrieve pending requests without review permission', async () => {
    jest.mocked(haveActionPermission).mockImplementation(async (_, action) => action === 'SERVICE_ADMIN_READ' || action === 'EXPORT');
    jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 200, data: '"ID"\r\n' });
    expect((await listAdminPublicationsAction({ types: ['SERVICE'], status: 'ALL', page: 0, size: 12 })).content).toEqual([]);
    expect(actionFetchWrapper).not.toHaveBeenCalledWith(expect.objectContaining({ url: expect.stringContaining('service-publication-requests') }));
});

it('removes letters from amount and phone inputs, including pasted values', () => {
    expect(maskServiceAmount('asd')).toBe('');
    expect(maskServiceAmount('R$ 100,50')).toBe('100,50');
    expect(maskServiceAmount('123.456')).toBe('123,45');
    expect(maskServiceAmount('100,123')).toBe('100,12');
    expect(unMaskPhoneNumber('telefone: (12) 99999-9999')).toBe('12999999999');
});
