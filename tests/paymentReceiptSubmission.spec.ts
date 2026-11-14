import { submitMemberPaymentAction } from "@/server/actions/billing/memberPayments/submit";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { paymentReceiptFileSchema, paymentReceiptSubmissionSchema, PAYMENT_RECEIPT_MAX_BYTES } from "@/schemas/billing/paymentReceipt";
import { ActionError } from "@/utils/http/ActionError";

jest.mock("@/services/fetchWrapper/actionFetchWrapper", () => ({ __esModule: true, default: jest.fn() }));

function form() {
    const body = new FormData();
    body.set("amount", "250.00");
    body.set("paymentMethod", "PIX");
    body.set("paidAt", "2026-11-13T18:30:00.000Z");
    body.set("notes", " Pagamento de teste ");
    body.set("receiptFile", new File(["%PDF-1.4\ncomprovante sintético"], "comprovante.pdf", { type: "application/pdf" }));
    return body;
}

beforeEach(() => jest.resetAllMocks());

it("submits authenticated multipart to the charge's review queue without a member/admin permission requirement", async () => {
    jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 201, data: { id: 10, status: "PENDING_VALIDATION" } });
    await expect(submitMemberPaymentAction(42, form())).resolves.toEqual({ id: 10, status: "PENDING_VALIDATION" });
    const request = jest.mocked(actionFetchWrapper).mock.calls[0][0];
    expect(request).toMatchObject({ url: "billing/member-charges/42/payments", method: "POST", cache: "no-store" });
    expect(request.headers).toBeUndefined(); // fetchWrapper supplies the multipart boundary.
    const body = request.body as FormData;
    expect(body.get("amount")).toBe("250.00");
    expect(body.get("paymentMethod")).toBe("PIX");
    expect(body.get("paidAt")).toBe("2026-11-13T18:30:00.000Z");
    expect(body.get("notes")).toBe("Pagamento de teste");
    const file = body.get("receiptFile") as File;
    expect(file.name).toBe("comprovante.pdf");
    expect(await file.text()).toContain("%PDF-1.4");
});

it.each(["amount", "paymentMethod", "paidAt", "receiptFile"])("rejects missing %s before the API call", async (field) => {
    const body = form();
    body.delete(field);
    await expect(submitMemberPaymentAction(42, body)).rejects.toBeInstanceOf(ActionError);
    expect(actionFetchWrapper).not.toHaveBeenCalled();
});

it.each([0, -1, 1.5])("rejects invalid charge id %s", async (id) => {
    await expect(submitMemberPaymentAction(id, form())).rejects.toBeInstanceOf(ActionError);
    expect(actionFetchWrapper).not.toHaveBeenCalled();
});

it.each([
    new File([], "empty.pdf", { type: "application/pdf" }),
    new File(["text"], "receipt.txt", { type: "text/plain" }),
    new File(["text"], "receipt.exe", { type: "application/pdf" }),
    new File([new Uint8Array(PAYMENT_RECEIPT_MAX_BYTES + 1)], "large.pdf", { type: "application/pdf" }),
])("rejects invalid receipt: %s", (file) => {
    expect(paymentReceiptFileSchema.safeParse(file).success).toBe(false);
});

it.each([
    { amount: "250.001" }, { paymentMethod: "UNKNOWN" }, { paidAt: "invalid" }, { notes: "x".repeat(501) },
])("rejects malformed metadata %s", (patch) => {
    expect(paymentReceiptSubmissionSchema.safeParse({ ...Object.fromEntries(form()), ...patch }).success).toBe(false);
});

it("preserves ownership, expired-window and duplicate errors from the API", async () => {
    const error = new ActionError("Já existe um comprovante.", { status: 409, code: "MEMBER_PAYMENT_ALREADY_EXISTS" });
    jest.mocked(actionFetchWrapper).mockRejectedValue(error);
    await expect(submitMemberPaymentAction(42, form())).rejects.toBe(error);
});
