import { eventChargeSchema, eventChargesSchema, createPublicationSchema, parseEventChargeRows } from '@/schemas/publications/create';
import { eventChargeRuleSchema, eventChargeCatalogSchema } from '@/schemas/publications/admin';
import { getEventChargesAction, listEventChargeCatalogAction } from '@/server/actions/publications/events';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { haveActionPermission } from '@/utils/permission/actionPermissions';
jest.mock('@/services/fetchWrapper/actionFetchWrapper', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/utils/permission/actionPermissions', () => ({ haveActionPermission: jest.fn() }));
beforeEach(() => jest.resetAllMocks());
it('separa definição existente de inline e flags independentes', () => {
    expect(eventChargeSchema.parse({ name: 'Transporte', amount: 1.1234, billingRequired: false, requiredForParticipation: true })).toEqual({ name: 'Transporte', amount: 1.1234, billingRequired: false, requiredForParticipation: true });
    expect(eventChargeSchema.safeParse({ chargeDefinitionId: 1, name: 'Indevido', amount: 1 }).success).toBe(false);
    expect(eventChargesSchema.safeParse([{ chargeDefinitionId: 1 }, { chargeDefinitionId: 1 }]).success).toBe(false);
    expect(eventChargeSchema.safeParse({ chargeDefinitionId: 1, financialDueDate: '2020-01-01' }).success).toBe(true);
});
it('regras não inventam valor histórico e catálogo preserva policy', () => {
    expect(eventChargeRuleSchema.parse({ eventId: 1, chargeDefinitionId: 4, requiredForParticipation: false, participationCutoff: '2099-11-15T11:00:00Z', financialDueDate: null })).not.toHaveProperty('amount');
    expect(eventChargeCatalogSchema.parse({ id: 4, name: 'A', description: null, defaultAmount: 12, required: true, paymentAcceptancePolicy: 'AFTER_DUE_DATE' }).required).toBe(true);
});
it('catálogo permite CREATE sem READ e preserva página; regras exigem READ', async () => {
    jest.mocked(haveActionPermission).mockImplementation(async (_, action) => action === 'EVENT_CREATE');
    jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 200, data: { content: [] } });
    await listEventChargeCatalogAction({ page: 2, size: 12 });
    expect(actionFetchWrapper).toHaveBeenCalledWith(expect.objectContaining({ url: 'admin/events/charge-catalog?page=2&size=12&sort=id%2Cdesc' }));
    await expect(getEventChargesAction(1)).rejects.toThrow('permissão');
    expect(actionFetchWrapper).toHaveBeenCalledTimes(1);
});
it('cria evento com charges e rejeita cutoff depois do início', () => {
    const event = { type: 'EVENT', title: 'Evento', content: 'Texto', startsAt: '2099-11-15T11:00:00Z', endsAt: null, images: [{ storageKey: 'images/2026/10/30/550e8400-e29b-41d4-a716-446655440000.jpg', position: 0, primary: true }], charges: [{ name: 'A', amount: 15, billingRequired: true, requiredForParticipation: false }] };
    expect(createPublicationSchema.parse(event)).toHaveProperty('charges', event.charges);
    expect(createPublicationSchema.safeParse({ ...event, charges: [{ chargeDefinitionId: 1, participationCutoff: '2099-11-16T11:00:00Z' }] }).success).toBe(false);
});
it('não envia campos inline ao selecionar existente e verifica policy', () => {
    const row = { mode: 'existing' as const, chargeDefinitionId: '4', name: 'Antigo', description: '', amount: '100', billingRequired: true, requiredForParticipation: false, participationCutoff: '', financialDueDate: '2000-01-01', paymentAcceptancePolicy: 'BEFORE_DUE_DATE' };
    expect(parseEventChargeRows([row], '2099-11-15T11:00:00Z')).toEqual([{ chargeDefinitionId: 4, requiredForParticipation: false, financialDueDate: '2000-01-01' }]);
    expect(() => parseEventChargeRows([{ ...row, requiredForParticipation: true }], '2099-11-15T11:00:00Z')).toThrow('AFTER_DUE_DATE');
});
