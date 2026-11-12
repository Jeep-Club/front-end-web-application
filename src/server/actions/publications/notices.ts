'use server';
import { adminNoticeSchema, noticeUpdateSchema, publicationIdSchema } from '@/schemas/publications/admin';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { haveActionPermission } from '@/utils/permission/actionPermissions';
import { ActionError } from '@/utils/http/ActionError';
import type { z } from 'zod';

export async function getAdminNoticeAction(id: number) {
    if (!publicationIdSchema.safeParse(id).success) throw new ActionError('ID de aviso inválido.');
    if (!await haveActionPermission('PUBLICATIONS', 'NOTICE_READ')) throw new ActionError('Você não tem permissão para consultar avisos.', { status: 403 });
    return (await actionFetchWrapper({ url: `admin/notices/${id}`, method: 'GET', cache: 'no-store', schema: adminNoticeSchema })).data;
}
export async function updateAdminNoticeAction(id: number, input: z.infer<typeof noticeUpdateSchema>) {
    const parsed = noticeUpdateSchema.safeParse(input);
    if (!publicationIdSchema.safeParse(id).success || !parsed.success) throw new ActionError(parsed.error?.issues[0]?.message ?? 'Dados de aviso inválidos.');
    if (!await haveActionPermission('PUBLICATIONS', 'NOTICE_UPDATE')) throw new ActionError('Você não tem permissão para editar avisos.', { status: 403 });
    return (await actionFetchWrapper({ url: `admin/notices/${id}`, method: 'PATCH', body: JSON.stringify(parsed.data), schema: adminNoticeSchema })).data;
}
