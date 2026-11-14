import { ActionError } from "@/utils/http/ActionError";
import { canAccessMembershipPage, resolveMembershipAccess } from "@/utils/membership/access";

describe("membership access decided by the backend", () => {
    it("allows access when the membership-protected read succeeds", async () => {
        await expect(resolveMembershipAccess(async () => ({ content: [] }))).resolves.toBe("allowed");
    });

    it("requires both the 402 status and the payment-required code", async () => {
        const error = new ActionError("Pagamento necessário", { status: 402, code: "MEMBERSHIP_PAYMENT_REQUIRED" });
        await expect(resolveMembershipAccess(() => Promise.reject(error))).resolves.toBe("payment-required");
    });

    it("preserves expired-session errors for the authentication flow", async () => {
        const error = new ActionError("Sessão expirada", { status: 401, code: "SESSION_EXPIRED" });
        await expect(resolveMembershipAccess(() => Promise.reject(error))).rejects.toBe(error);
    });

    it.each([
        new ActionError("Cobrança indisponível", { status: 503, code: "MEMBERSHIP_CHARGE_UNAVAILABLE" }),
        new ActionError("Sem permissão", { status: 403, code: "FORBIDDEN" }),
        new ActionError("Outro pagamento", { status: 402, code: "EVENT_PAYMENT_REQUIRED" }),
        new ActionError("Código incorreto", { status: 403, code: "MEMBERSHIP_PAYMENT_REQUIRED" }),
        new TypeError("fetch failed"),
    ])("does not classify an unavailable check as nonpayment: %s", async (error) => {
        await expect(resolveMembershipAccess(() => Promise.reject(error))).resolves.toBe("unavailable");
    });

    it.each(["payment-required", "unavailable"] as const)("keeps only the exact payment history route open when %s", (access) => {
        expect(canAccessMembershipPage(access, "/financeiro")).toBe(true);
        for (const pathname of ["/feed", "/profile", "/admin", "/admin/gestao-financeira", "/agenda", "/financeiro-outra", "/financeiro/qualquer"]) {
            expect(canAccessMembershipPage(access, pathname)).toBe(false);
        }
    });

    it("restores all pages after the backend allows access", async () => {
        const check = jest.fn()
            .mockRejectedValueOnce(new ActionError("Pendente", { status: 402, code: "MEMBERSHIP_PAYMENT_REQUIRED" }))
            .mockResolvedValueOnce({ content: [] });
        expect(canAccessMembershipPage(await resolveMembershipAccess(check), "/feed")).toBe(false);
        expect(canAccessMembershipPage(await resolveMembershipAccess(check), "/feed")).toBe(true);
    });
});
