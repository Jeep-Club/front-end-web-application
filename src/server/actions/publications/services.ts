'use server';
import { adminServiceSchema, publicationIdSchema } from '@/schemas/publications/admin';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { haveActionPermission } from '@/utils/permission/actionPermissions';
import { ActionError } from '@/utils/http/ActionError';
import { mutatePublishedPublicationAction } from './published';

export async function getAdminServicePublicationAction(id: number) {
    if (!publicationIdSchema.safeParse(id).success) throw new ActionError('ID de serviço inválido.');
    if (!await haveActionPermission('PUBLICATIONS', 'SERVICE_ADMIN_READ')) throw new ActionError('Você não tem permissão para consultar serviços.', { status: 403 });
    return (await actionFetchWrapper({ url: `admin/services/${id}`, method: 'GET', cache: 'no-store', schema: adminServiceSchema })).data;
}
export async function deleteAdminServicePublicationAction(id: number) {
    if (!publicationIdSchema.safeParse(id).success) throw new ActionError('ID de serviço inválido.');
    return mutatePublishedPublicationAction({ id, type: 'SERVICE', action: 'delete' });
}
