"use server";

import { z } from "zod";
import { paymentReceiptSubmissionSchema } from "@/schemas/billing/paymentReceipt";
import { paymentSchema } from "@/schemas/billing/management";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { ActionError } from "@/utils/http/ActionError";

/** Owner-only submission remains available while membership access is blocked.
 * The API checks ownership, payment window, exact charge amount and duplicate submissions.
 */
export async function submitMemberPaymentAction(chargeId: number, form: FormData) {
    const id = z.number().int().positive().safeParse(chargeId);
    if (!id.success) throw new ActionError("Cobrança inválida.");
    if (!(form instanceof FormData)) throw new ActionError("Dados de pagamento inválidos.");
    const parsed = paymentReceiptSubmissionSchema.safeParse({
        amount: form.get("amount"), paymentMethod: form.get("paymentMethod"),
        paidAt: form.get("paidAt"), receiptFile: form.get("receiptFile"), notes: form.get("notes") ?? "",
    });
    if (!parsed.success) throw new ActionError(parsed.error.issues[0].message);
    const body = new FormData();
    body.set("amount", parsed.data.amount.toFixed(2));
    body.set("paymentMethod", parsed.data.paymentMethod);
    body.set("paidAt", parsed.data.paidAt);
    body.set("receiptFile", parsed.data.receiptFile, parsed.data.receiptFile.name);
    if (parsed.data.notes) body.set("notes", parsed.data.notes);
    const { data } = await actionFetchWrapper({
        url: `billing/member-charges/${id.data}/payments`,
        method: "POST", body, cache: "no-store", schema: paymentSchema,
    });
    return { id: data.id, status: data.status };
}
