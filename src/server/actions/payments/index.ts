"use server";

import { ActionError } from "@/utils/http/ActionError";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { paymentPermissions } from "@/config/paymentPermissions";
import { paymentDetailSchema, paymentFiltersSchema, paymentIdSchema, paymentPageSchema, rejectPaymentSchema, type PaymentFilters } from "@/schemas/payments";
import { HttpAPIRoutes } from "@/utils/http/api";
import { SESSION_EXPIRED_MESSAGE } from "@/utils/http/apiError";
import { haveActionPermission } from "@/utils/permission/actionPermissions";

async function requirePermission(action: string) {
    const allowed = await haveActionPermission(paymentPermissions.module, action).catch(() => {
        throw new ActionError(SESSION_EXPIRED_MESSAGE);
    });
    if (!allowed) {
        throw new ActionError("Você não possui permissão para esta operação.");
    }
}

export async function listPaymentsAction(filters: PaymentFilters) {
    await requirePermission(paymentPermissions.read);
    const data = paymentFiltersSchema.parse(filters);
    const params = new URLSearchParams({ page: String(data.page), size: String(data.size), sort: "createdAt,desc" });
    params.append("sort", "id,desc");
    if (data.status) params.set("status", data.status);
    const response = await actionFetchWrapper({
        url: `${HttpAPIRoutes.BILLING_PAYMENTS}?${params}`,
        method: "GET",
        cache: "no-store",
        schema: paymentPageSchema,
    });
    return response.data;
}

export async function getPaymentAction(id: number) {
    await requirePermission(paymentPermissions.read);
    paymentIdSchema.parse(id);
    const response = await actionFetchWrapper({
        url: `${HttpAPIRoutes.BILLING_PAYMENTS}/${id}`,
        method: "GET",
        cache: "no-store",
        schema: paymentDetailSchema,
    });
    return response.data;
}

export async function confirmPaymentAction(id: number) {
    await requirePermission(paymentPermissions.read);
    await requirePermission(paymentPermissions.confirm);
    paymentIdSchema.parse(id);
    const response = await actionFetchWrapper({
        url: `${HttpAPIRoutes.BILLING_PAYMENTS}/${id}/confirm`,
        method: "PATCH",
        schema: paymentDetailSchema,
    });
    return response.data;
}

export async function rejectPaymentAction(id: number, rejectionReason: string) {
    await requirePermission(paymentPermissions.read);
    await requirePermission(paymentPermissions.reject);
    paymentIdSchema.parse(id);
    const result = rejectPaymentSchema.safeParse({ rejectionReason });
    if (!result.success) throw new ActionError(result.error.issues[0].message);
    const response = await actionFetchWrapper({
        url: `${HttpAPIRoutes.BILLING_PAYMENTS}/${id}/reject`,
        method: "PATCH",
        body: JSON.stringify(result.data),
        schema: paymentDetailSchema,
    });
    return response.data;
}
