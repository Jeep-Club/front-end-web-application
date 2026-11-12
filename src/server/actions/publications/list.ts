"use server";
import { z } from 'zod';
import { pageResponseSchema } from '@/schemas/page';
import { adminEventSchema } from '@/schemas/publications/admin';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { haveActionPermission } from '@/utils/permission/actionPermissions';
import { ActionError } from '@/utils/http/ActionError';

/** Only events have an administrative JSON collection. Never derive CRUD lists from exports. */
export async function listAdminPublicationsAction(input: { page: number; size: number; sort?: 'id,desc' | 'startsAt,asc' | 'startsAt,desc' | 'createdAt,asc' | 'createdAt,desc' }) {
    if (!await haveActionPermission('PUBLICATIONS', 'EVENT_READ_ADMIN')) throw new ActionError('Você não tem permissão para consultar eventos.', { status: 403 });
    const parsed = z.object({ page: z.number().int().nonnegative(), size: z.number().int().min(1).max(50), sort: z.enum(['id,desc', 'startsAt,asc', 'startsAt,desc', 'createdAt,asc', 'createdAt,desc']).default('id,desc') }).safeParse(input);
    if (!parsed.success) throw new ActionError('Paginação inválida.');
    const params = new URLSearchParams({ page: String(parsed.data.page), size: String(parsed.data.size), sort: parsed.data.sort });
    if (parsed.data.sort !== 'id,desc') params.append('sort', parsed.data.sort === 'createdAt,asc' ? 'id,asc' : 'id,desc');
    return (await actionFetchWrapper({ url: `admin/events?${params}`, method: 'GET', cache: 'no-store', schema: pageResponseSchema(adminEventSchema) })).data;
}
