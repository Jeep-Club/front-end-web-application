import { getMyEventRegistrationAction, registerForEventAction } from '@/server/actions/publications/event-registration';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { haveActionPermission } from '@/utils/permission/actionPermissions';
import { ActionError } from '@/utils/http/ActionError';

jest.mock('@/services/fetchWrapper/actionFetchWrapper', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/utils/permission/actionPermissions', () => ({ haveActionPermission: jest.fn() }));

beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(haveActionPermission).mockResolvedValue(true);
});

it('trata somente ausência de inscrição como estado vazio, preservando rota/evento inacessível', async () => {
    jest.mocked(actionFetchWrapper).mockRejectedValueOnce(new ActionError('Sem inscrição', { status: 404, code: 'EVENT_REGISTRATION_NOT_FOUND' }));
    await expect(getMyEventRegistrationAction(7)).resolves.toBeNull();
    expect(actionFetchWrapper).toHaveBeenCalledWith(expect.objectContaining({ url: 'events/7/registrations/me', method: 'GET' }));
    const inaccessible = new ActionError('Evento indisponível', { status: 404, code: 'EVENT_NOT_FOUND' });
    jest.mocked(actionFetchWrapper).mockRejectedValueOnce(inaccessible);
    await expect(getMyEventRegistrationAction(7)).rejects.toBe(inaccessible);
});

it('envia alocações conforme controller e não eleva permissão de inscrição para leitura', async () => {
    jest.mocked(haveActionPermission).mockImplementation(async (_, action) => action === 'EVENT_REGISTER');
    await expect(getMyEventRegistrationAction(7)).rejects.toThrow();
    expect(actionFetchWrapper).not.toHaveBeenCalled();
    jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 201, data: {} });
    await registerForEventAction(7, { vehicleId: 2, dependentIds: [3] });
    expect(actionFetchWrapper).toHaveBeenCalledWith(expect.objectContaining({ url: 'events/7/registrations', body: JSON.stringify({ allocations: [{ vehicleId: 2, member: true, dependentIds: [3] }], dependentIds: [] }) }));
});
