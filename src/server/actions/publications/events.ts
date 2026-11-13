'use server';
import { adminEventSchema, publicationIdSchema, eventUpdateSchema, eventChargeCatalogSchema, eventChargeRuleSchema, adminEventDashboardSchema } from '@/schemas/publications/admin';
import { z } from 'zod';
import { pageResponseSchema } from '@/schemas/page';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { haveActionPermission } from '@/utils/permission/actionPermissions';
import { ActionError } from '@/utils/http/ActionError';

export async function getAdminEventAction(id: number) {
    if (!publicationIdSchema.safeParse(id).success) throw new ActionError('ID de evento inválido.');
    if (!await haveActionPermission('PUBLICATIONS', 'EVENT_READ_ADMIN')) throw new ActionError('Você não tem permissão para consultar eventos.', { status: 403 });
    return (await actionFetchWrapper({ url: `admin/events/${id}`, method: 'GET', cache: 'no-store', schema: adminEventSchema })).data;
}

export async function updateAdminEventAction(id: number, input: z.infer<typeof eventUpdateSchema>) {
    const parsed = eventUpdateSchema.safeParse(input);
    if (!publicationIdSchema.safeParse(id).success || !parsed.success) throw new ActionError(parsed.error?.issues[0]?.message ?? 'Dados de evento inválidos.');
    if (!await haveActionPermission('PUBLICATIONS', 'EVENT_UPDATE')) throw new ActionError('Você não tem permissão para editar eventos.', { status: 403 });
    if (parsed.data.startsAt && Date.parse(parsed.data.startsAt) <= Date.now()) throw new ActionError('O início deve estar no futuro.');
    if (parsed.data.startsAt && parsed.data.endsAt && Date.parse(parsed.data.endsAt) <= Date.parse(parsed.data.startsAt)) throw new ActionError('O término deve ser posterior ao início.');
    return (await actionFetchWrapper({ url: `admin/events/${id}`, method: 'PATCH', body: JSON.stringify(parsed.data), schema: adminEventSchema })).data;
}

export async function listEventChargeCatalogAction(input: { page: number; size: number }) {
    const parsed = z.object({ page: z.number().int().nonnegative(), size: z.number().int().min(1).max(50) }).safeParse(input);
    if (!parsed.success) throw new ActionError('Paginação inválida.');
    if (!await haveActionPermission('PUBLICATIONS', 'EVENT_CREATE') && !await haveActionPermission('PUBLICATIONS', 'EVENT_UPDATE')) throw new ActionError('Você não tem permissão para consultar o catálogo.', { status: 403 });
    const params = new URLSearchParams({ page: String(parsed.data.page), size: String(parsed.data.size), sort: 'id,desc' });
    return (await actionFetchWrapper({ url: `admin/events/charge-catalog?${params}`, method: 'GET', cache: 'no-store', schema: pageResponseSchema(eventChargeCatalogSchema) })).data;
}
export async function getEventChargesAction(id: number) {
    if (!publicationIdSchema.safeParse(id).success) throw new ActionError('ID de evento inválido.');
    if (!await haveActionPermission('PUBLICATIONS', 'EVENT_READ_ADMIN')) throw new ActionError('Você não tem permissão para consultar regras.', { status: 403 });
    return (await actionFetchWrapper({ url: `admin/events/${id}/charges`, method: 'GET', cache: 'no-store', schema: z.array(eventChargeRuleSchema) })).data;
}

export async function getAdminEventDashboardAction(id: number) {
    if (!publicationIdSchema.safeParse(id).success) throw new ActionError('ID de evento inválido.');
    if (!await haveActionPermission('PUBLICATIONS', 'EVENT_ADMIN_DASHBOARD_READ')) throw new ActionError('Você não tem permissão para consultar o dashboard.', { status: 403 });
    return (await actionFetchWrapper({ url: `admin/events/${id}/dashboard`, method: 'GET', cache: 'no-store', schema: adminEventDashboardSchema })).data;
}
