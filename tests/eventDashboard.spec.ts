import { adminEventDashboardSchema } from '@/schemas/publications/admin';
import { getAdminEventDashboardAction } from '@/server/actions/publications/events';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { haveActionPermission } from '@/utils/permission/actionPermissions';
jest.mock('@/services/fetchWrapper/actionFetchWrapper', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/utils/permission/actionPermissions', () => ({ haveActionPermission: jest.fn() }));
const totals = { dependents: 0, guestsPending: 0, guestsApproved: 0, totalPeople: 0, vehicles: 0, totalCapacity: 0, availableSeats: 0, unpaidCharges: 0, pendingValidation: 0, postCutoffPending: 0, guestsStandby: 0, guestsAllocated: 0, guestsCancelled: 0 };
it('aceita totais vazios e fatos financeiros nullable, mantendo canceladas', () => {
    const dashboard = adminEventDashboardSchema.parse({ ...totals, registrations: [{ id: 1, eventId: 1, userId: 7, status: 'CANCELLED', allocations: [], createdAt: '2026-10-30T12:00:00Z', confirmedAt: null, cancelledAt: '2026-10-30T12:00:00Z', unallocatedDependentIds: [] }], financial: [{ chargeDefinitionId: 1, userId: 7, memberChargeId: null, effectiveStatus: null, paymentStatus: 'PENDING_VALIDATION', paymentSubmittedAt: null, definitionName: null, amount: null, chargeCycleId: null, dueDate: null }] });
    expect(dashboard.registrations[0].status).toBe('CANCELLED');
    expect(dashboard.financial[0].amount).toBeNull();
});
it('exige permission própria sem elevar READ ou saúde', async () => {
    jest.mocked(haveActionPermission).mockImplementation(async (_, action) => action === 'EVENT_ADMIN_DASHBOARD_READ');
    jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 200, data: { ...totals, registrations: [], financial: [] } });
    await getAdminEventDashboardAction(1);
    expect(haveActionPermission).toHaveBeenCalledWith('PUBLICATIONS', 'EVENT_ADMIN_DASHBOARD_READ');
    expect(actionFetchWrapper).toHaveBeenCalledTimes(1);
    expect(actionFetchWrapper).toHaveBeenCalledWith(expect.objectContaining({ url: 'admin/events/1/dashboard' }));
});
