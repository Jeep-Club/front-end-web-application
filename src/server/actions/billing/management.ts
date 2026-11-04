"use server";

import { ActionError } from "@/utils/http/ActionError";

import { billingResources,managementSchemas,type BillingRecord,type BillingResource } from "@/schemas/billing/management";
import { pageResponseSchema } from "@/schemas/page";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { z } from "zod";

const paths = { cycles: "charge-cycles", "member-charges": "member-charges", payments: "member-payments", refunds: "member-refunds" };
const resourceSchema = z.enum(billingResources);
const idSchema = z.number().int().positive();
const operations = {
    cycles: ["cancel", "finish", "archive"],
    "member-charges": ["cancel", "final-amount"],
    payments: ["confirm", "reject"],
    refunds: ["approve", "reject", "mark-as-refunded", "expire", "cancel"],
};

export async function listBillingAction(resource: BillingResource, filters: { page: number; size: number; definitionId?: number; cycleId?: number; userId?: number; status?: string }): Promise<PageResponse<BillingRecord>> {
    resourceSchema.parse(resource);
    const query = new URLSearchParams({ page: String(z.number().int().nonnegative().parse(filters.page)), size: String(z.number().int().min(1).max(50).parse(filters.size)) });
    let path: string = paths[resource];
    if (resource === "cycles") {
        path = `charge-definitions/${idSchema.parse(filters.definitionId)}/cycles`;
    } else if (resource === "refunds" && filters.cycleId) {
        path = `charge-cycles/${idSchema.parse(filters.cycleId)}/member-refunds`;
    } else {
        if (filters.status) query.set("status", filters.status);
        if (resource === "member-charges" && filters.userId) query.set("userId", String(idSchema.parse(filters.userId)));
    }
    const response = await actionFetchWrapper({ url: `billing/${path}?${query}`, method: "GET", schema: pageResponseSchema(managementSchemas[resource] as z.ZodType<BillingRecord>) });
    return response.data;
}

export async function getBillingAction(resource: BillingResource, id: number): Promise<BillingRecord> {
    resourceSchema.parse(resource); idSchema.parse(id);
    return (await actionFetchWrapper({ url: `billing/${paths[resource]}/${id}`, method: "GET", schema: managementSchemas[resource] as z.ZodType<BillingRecord> })).data;
}

export async function mutateBillingAction(resource: BillingResource, id: number, operation: string, value?: string): Promise<BillingRecord> {
    resourceSchema.parse(resource); idSchema.parse(id);
    if (!operations[resource].includes(operation)) throw new ActionError("Operação financeira inválida.");
    const body = operation === "reject" ? { rejectionReason: z.string().trim().min(1).max(500).parse(value) }
        : operation === "final-amount" ? { finalAmount: z.coerce.number().finite().min(0.01).parse(value) } : undefined;
    return (await actionFetchWrapper({ url: `billing/${paths[resource]}/${id}/${operation}`, method: "PATCH", ...(body ? { body: JSON.stringify(body) } : {}), schema: managementSchemas[resource] as z.ZodType<BillingRecord> })).data;
}
