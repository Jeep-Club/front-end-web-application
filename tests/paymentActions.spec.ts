import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { confirmPaymentAction, getPaymentAction, listPaymentsAction, rejectPaymentAction } from "@/actions/payments";

jest.mock("@/services/fetchWrapper/actionFetchWrapper", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("@/utils/permission/actionPermissions", () => ({ haveActionPermission: jest.fn() }));
const fetchAction = jest.mocked(actionFetchWrapper);
const permission = jest.mocked(haveActionPermission);

describe("análise administrativa de pagamentos", () => {
    beforeEach(() => {
        jest.resetAllMocks();
        permission.mockResolvedValue(true);
        fetchAction.mockResolvedValue({ status: 200, data: { id: 12, status: "CONFIRMED" } });
    });

    it("envia filtro e paginação à API com ordenação estável", async () => {
        await listPaymentsAction({ status: "PENDING_VALIDATION", page: 2, size: 50 });
        const request = fetchAction.mock.calls[0][0];
        const url = new URL(request.url, "http://localhost");
        expect(url.pathname).toBe("/billing/member-payments");
        expect(url.searchParams.get("status")).toBe("PENDING_VALIDATION");
        expect(url.searchParams.get("page")).toBe("2");
        expect(url.searchParams.get("size")).toBe("50");
        expect(url.searchParams.getAll("sort")).toEqual(["createdAt,desc", "id,desc"]);
        expect(request.cache).toBe("no-store");
    });

    it("lista todos os status quando nenhum filtro é informado", async () => {
        await listPaymentsAction({ page: 0, size: 20 });
        expect(fetchAction.mock.calls[0][0].url).not.toContain("status=");
    });

    it.each([
        () => listPaymentsAction({ page: 0, size: 20 }),
        () => getPaymentAction(12),
        () => confirmPaymentAction(12),
        () => rejectPaymentAction(12, "Comprovante ilegível"),
    ])("bloqueia chamadas diretas sem leitura", async action => {
        permission.mockResolvedValue(false);
        await expect(action()).rejects.toThrow("permissão");
        expect(fetchAction).not.toHaveBeenCalled();
    });

    it.each([
        ["PAYMENT_CONFIRM", () => confirmPaymentAction(12)],
        ["PAYMENT_REJECT", () => rejectPaymentAction(12, "Comprovante ilegível")],
    ] as const)("bloqueia decisão sem %s, mesmo com leitura", async (action, execute) => {
        permission.mockImplementation(async (_module, requested) => requested !== action);
        await expect(execute()).rejects.toThrow("permissão");
        expect(fetchAction).not.toHaveBeenCalled();
    });

    it("retorna os dados atualizados após confirmar", async () => {
        await expect(confirmPaymentAction(12)).resolves.toEqual({ id: 12, status: "CONFIRMED" });
        expect(fetchAction).toHaveBeenCalledWith(expect.objectContaining({ url: "billing/member-payments/12/confirm", method: "PATCH" }));
        expect(permission).toHaveBeenCalledWith("BILLING", "PAYMENT_CONFIRM");
    });

    it("envia o motivo normalizado na rejeição", async () => {
        await rejectPaymentAction(12, "  Comprovante ilegível  ");
        expect(fetchAction).toHaveBeenCalledWith(expect.objectContaining({
            url: "billing/member-payments/12/reject", method: "PATCH",
            body: JSON.stringify({ rejectionReason: "Comprovante ilegível" }),
        }));
    });

    it.each(["", "   ", "a".repeat(501)])("não envia rejeição com motivo inválido", async reason => {
        await expect(rejectPaymentAction(12, reason)).rejects.toThrow();
        expect(fetchAction).not.toHaveBeenCalled();
    });

    it("preserva a mensagem de conflito para decisões concorrentes", async () => {
        fetchAction.mockRejectedValue({ status: 409, rawData: {
            status: 409, code: "INVALID_MEMBER_PAYMENT_STATE", detail: "O pagamento já foi analisado.",
        } });
        await expect(confirmPaymentAction(12)).rejects.toThrow("O pagamento já foi analisado.");
    });

    it("rejeita paginação acima do limite da API antes de enviar", async () => {
        await expect(listPaymentsAction({ page: 0, size: 51 })).rejects.toThrow();
        expect(fetchAction).not.toHaveBeenCalled();
    });

    it("sinaliza sessão expirada quando a permissão assinada é inválida", async () => {
        permission.mockRejectedValue(new Error("invalid token"));
        await expect(getPaymentAction(12)).rejects.toThrow("Sua sessão expirou.");
        expect(fetchAction).not.toHaveBeenCalled();
    });
});
