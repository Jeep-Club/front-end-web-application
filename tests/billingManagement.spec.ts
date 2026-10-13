import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { listBillingAction, mutateBillingAction } from "@/actions/billing/management";
import { chargeSchema, cycleSchema, refundSchema } from "@/schemas/billing/management";
import { adminModules, canAccessAdminModule } from "@/config/adminModules";
import { displayBillingValue } from "@/components/pages/admin/gestao-financeira/billingDisplay";

jest.mock("@/services/fetchWrapper/actionFetchWrapper", () => ({ __esModule: true, default: jest.fn() }));
const request = jest.mocked(actionFetchWrapper);
beforeEach(() => { request.mockReset(); request.mockResolvedValue({ status: 200, data: {} }); });

it("uses the definition-scoped cycle API and refuses an absent definition", async () => {
    await expect(listBillingAction("cycles", { page: 0, size: 10 })).rejects.toThrow();
    expect(request).not.toHaveBeenCalled();
    await listBillingAction("cycles", { page: 1, size: 20, definitionId: 4 });
    expect(request.mock.calls[0][0].url).toBe("billing/charge-definitions/4/cycles?page=1&size=20");
});

it("uses the cycle refund endpoint without unsupported status filters", async () => {
    await listBillingAction("refunds", { page: 0, size: 10, cycleId: 5, status: "ELIGIBLE" });
    expect(request.mock.calls[0][0].url).toBe("billing/charge-cycles/5/member-refunds?page=0&size=10");
});

it("filters charges by persisted status and member, preserving effective status in the response", async () => {
    await listBillingAction("member-charges", { page: 0, size: 10, userId: 7, status: "PENDING" });
    expect(request.mock.calls[0][0].url).toContain("status=PENDING&userId=7");
    const charge = { id: 1, userId: 7, chargeDefinitionId: 4, chargeCycleId: 5, finalAmount: 100, dueDate: "2026-01-01", paymentAcceptancePolicy: "AFTER_DUE_DATE", paymentAllowedUntil: null, status: "PENDING", effectiveStatus: "OVERDUE" };
    expect(chargeSchema.parse(charge).effectiveStatus).toBe("OVERDUE");
    expect(chargeSchema.safeParse({ ...charge, status: "OVERDUE" }).success).toBe(false);
});

it("rejects blank reasons, invalid adjustments and cross-resource operations before sending requests", async () => {
    await expect(mutateBillingAction("payments", 1, "reject", "   ")).rejects.toThrow();
    await expect(mutateBillingAction("member-charges", 1, "final-amount", "0")).rejects.toThrow();
    await expect(mutateBillingAction("payments", 1, "approve")).rejects.toThrow();
    expect(request).not.toHaveBeenCalled();
    await mutateBillingAction("payments", 1, "reject", " Valor divergente ");
    expect(request.mock.calls[0][0]).toMatchObject({ url: "billing/member-payments/1/reject", method: "PATCH", body: JSON.stringify({ rejectionReason: "Valor divergente" }) });
});

it("accepts null audit dates and canceled cycle histories from the backend", () => {
    expect(cycleSchema.safeParse({ id: 5, chargeDefinitionId: 4, chargeDefinitionNameSnapshot: "Anuidade", code: "2026", dueDate: "2026-01-01", status: "CANCELED", chargeDefinitionPaymentAcceptancePolicySnapshot: "AFTER_DUE_DATE", canceledAt: "2026-01-02T12:00:00Z", archivedAt: null }).success).toBe(true);
    expect(refundSchema.safeParse({ id: 2, memberChargeId: 3, memberPaymentId: 4, chargeCycleId: 5, userId: 7, amount: 100, reason: "CYCLE_CANCELED_BY_ADMIN", status: "ELIGIBLE", eligibleUntil: null, requestedAt: null }).success).toBe(true);
});

it("grants page visibility to payment readers without definition access", () => {
    const finance = adminModules.find((module) => module.key === "financial-management")!;
    expect(canAccessAdminModule([{ module: "BILLING", actions: ["PAYMENT_READ"] }], finance)).toBe(true);
    expect(canAccessAdminModule([{ module: "BILLING", actions: ["PAYMENT_CONFIRM"] }], finance)).toBe(false);
});

it("formats date-only deadlines without shifting the calendar day", () => {
    expect(displayBillingValue("dueDate", "2026-10-13")).toBe("13/10/2026");
    expect(displayBillingValue("paymentAllowedUntil", null)).toBe("—");
});

it("normalizes legacy financial enum names for display without altering unknown text", () => {
    expect(displayBillingValue("paymentMethod", "BANK_TRANSFER")).toBe("Transferência bancária");
    expect(displayBillingValue("recurrenceType", "ONE_TIME")).toBe("Cobrança única");
    expect(displayBillingValue("paymentAcceptancePolicy", "UNTIL_DUE_DATE")).toBe("Até o vencimento");
    expect(displayBillingValue("notes", "Observação original")).toBe("Observação original");
    expect(displayBillingValue("notes", "PIX")).toBe("PIX");
});
