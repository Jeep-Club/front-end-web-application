"use server";
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { z } from 'zod';

export async function downloadBillingAction(kind: 'definitions' | 'cycles' | 'member-charges' | 'payments' | 'refunds' | 'receipt', format: 'CSV' | 'PDF', filters: Record<string, string> = {}, paymentId?: number) {
    z.enum(['definitions', 'cycles', 'member-charges', 'payments', 'refunds', 'receipt']).parse(kind);
    z.enum(['CSV', 'PDF']).parse(format);
    const allowedFilters = ['id', 'userId', 'chargeDefinitionId', 'chargeCycleId', 'eventId', 'recurrence', 'year', 'month', 'status', 'paymentMethod', 'chargeStatus', 'effectiveStatus', 'dueFrom', 'dueTo', 'from', 'to'];
    const query = new URLSearchParams({ format });
    for (const [key, value] of Object.entries(filters)) if (allowedFilters.includes(key) && value) query.set(key, value);
    const path = kind === 'receipt' ? `billing/member-payments/${z.number().int().positive().parse(paymentId)}/receipt` : `billing/admin/${kind}/export?${query}`;
    const { data: blob } = await actionFetchWrapper({
        url: path, cache: 'no-store', responseType: 'blob', schema: z.instanceof(Blob),
        allowedContentTypes: kind === 'receipt' ? ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'] : [format === 'CSV' ? 'text/csv' : 'application/pdf'],
    });
    const contentType = blob.type;
    const extension = kind !== 'receipt' ? format.toLowerCase() : contentType.includes('pdf') ? 'pdf' : contentType.includes('jpeg') ? 'jpg' : contentType.includes('webp') ? 'webp' : 'png';
    return { base64: Buffer.from(await blob.arrayBuffer()).toString('base64'), contentType, filename: kind === 'receipt' ? `comprovante-${paymentId}.${extension}` : `financeiro-${kind}.${extension}` };
}
