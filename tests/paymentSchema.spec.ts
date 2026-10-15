import { paymentDetailSchema, paymentPageSchema, rejectPaymentSchema } from "@/schemas/payments";

const summary = {
    id: 12, memberChargeId: 7, amount: 250, paymentMethod: "PIX", status: "PENDING_VALIDATION",
    paidAt: "2026-10-15T12:00:00Z", receiptUrl: "/billing/member-payments/12/receipt", createdAt: "2026-10-15T12:05:00Z",
};

it("aceita a paginação estável do backend sem exigir o campo sort do Spring", () => {
    expect(paymentPageSchema.safeParse({ content: [summary], number: 0, size: 20, totalElements: 1, totalPages: 1, numberOfElements: 1, first: true, last: true, empty: false }).success).toBe(true);
});

it("aceita campos de auditoria nulos para pagamentos ainda pendentes", () => {
    expect(paymentDetailSchema.safeParse({ ...summary, confirmedAt: null, confirmedByUserId: null, rejectedAt: null, rejectedByUserId: null, rejectionReason: null, canceledAt: null, notes: null, updatedAt: null }).success).toBe(true);
});

it("aceita o limite de 500 caracteres para o motivo", () => {
    expect(rejectPaymentSchema.safeParse({ rejectionReason: "a".repeat(500) }).success).toBe(true);
});
