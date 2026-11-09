"use server";
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { z } from 'zod';
import { getDownloadFilename } from '@/utils/http/contentDisposition';
import { haveActionPermission } from '@/utils/permission/actionPermissions';
import { ActionError } from '@/utils/http/ActionError';

export async function downloadBillingAction(kind: 'definitions' | 'cycles' | 'member-charges' | 'payments' | 'refunds' | 'receipt', format: 'CSV' | 'PDF', filters: Record<string, string> = {}, paymentId?: number) {
    const requiredPermission = kind === 'receipt' ? 'PAYMENT_READ' : 'EXPORT';
    if (!await haveActionPermission('BILLING', requiredPermission)) throw new ActionError('Acesso não permitido.');
    z.enum(['definitions', 'cycles', 'member-charges', 'payments', 'refunds', 'receipt']).parse(kind);
    z.enum(['CSV', 'PDF']).parse(format);
    const allowedFilters = ['id', 'userId', 'chargeDefinitionId', 'chargeCycleId', 'eventId', 'recurrence', 'year', 'month', 'status', 'paymentMethod', 'chargeStatus', 'effectiveStatus', 'dueFrom', 'dueTo', 'from', 'to'];
    const query = new URLSearchParams({ format });
    for (const [key, value] of Object.entries(filters)) if (allowedFilters.includes(key) && value) query.set(key, value);
    if (query.has('month')) {
        if (!query.has('year')) throw new Error('Informe o ano ao filtrar por mês.');
        const month = z.coerce.number().int().min(1).max(12).parse(query.get('month'));
        z.coerce.number().int().positive().parse(query.get('year'));
        query.set('month', String(month));
    }
    if (query.has('from') && query.has('to') && query.get('from')! > query.get('to')!) throw new Error('A data inicial deve preceder a final.');
    if (query.has('dueFrom') && query.has('dueTo') && query.get('dueFrom')! > query.get('dueTo')!) throw new Error('O vencimento inicial deve preceder o final.');
    const path = kind === 'receipt' ? `billing/member-payments/${z.number().int().positive().parse(paymentId)}/receipt` : `billing/admin/${kind}/export?${query}`;
    const response = await actionFetchWrapper({
        url: path, cache: 'no-store', responseType: 'blob', schema: z.instanceof(Blob),
        allowedContentTypes: kind === 'receipt' ? ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'] : [format === 'CSV' ? 'text/csv' : 'application/pdf'],
    });
    const blob = response.data;
    const contentType = blob.type;
    const extension = kind !== 'receipt' ? format.toLowerCase() : contentType.includes('pdf') ? 'pdf' : contentType.includes('jpeg') ? 'jpg' : contentType.includes('webp') ? 'webp' : 'png';
    const fallback = kind === 'receipt' ? `comprovante-${paymentId}.${extension}` : `financeiro-${kind}.${extension}`;
    return { base64: Buffer.from(await blob.arrayBuffer()).toString('base64'), contentType, filename: getDownloadFilename(response.contentDisposition, fallback) };
}
