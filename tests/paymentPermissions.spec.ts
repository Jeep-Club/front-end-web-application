import { verifyPermissions } from "@/services/token/permissions";
import { haveRoutePermissions } from "@/utils/permission/routePermissions";
import { getAvailableAdminModules, hasAnyAdminAccess } from "@/config/adminModules";

jest.mock("@/services/token/permissions", () => ({ verifyPermissions: jest.fn() }));
const verify = jest.mocked(verifyPermissions);

beforeEach(() => jest.resetAllMocks());

describe("visibilidade e acesso à análise de pagamentos", () => {
    it.each(["/admin/pagamentos", "/admin/pagamentos/12"])("permite leitura em %s", async pathname => {
        verify.mockResolvedValue([{ module: "BILLING", actions: ["PAYMENT_READ"] }]);
        await expect(haveRoutePermissions({ pathname, permissionsToken: "signed", onCatch: jest.fn() })).resolves.toBe(true);
    });

    it.each(["/admin/pagamentos", "/admin/pagamentos/12"])("nega %s quando há somente decisão", async pathname => {
        verify.mockResolvedValue([{ module: "BILLING", actions: ["PAYMENT_CONFIRM", "PAYMENT_REJECT"] }]);
        await expect(haveRoutePermissions({ pathname, permissionsToken: "signed", onCatch: jest.fn() })).resolves.toBe(false);
    });

    it("exibe o módulo e o painel administrativo para quem tem apenas leitura de pagamentos", () => {
        const permissions = [{ module: "BILLING", actions: ["PAYMENT_READ"] }];
        expect(getAvailableAdminModules(permissions).map(module => module.href)).toEqual(["/admin/pagamentos", "/admin/gestao-financeira"]);
        expect(hasAnyAdminAccess(permissions)).toBe(true);
    });

    it("oculta o módulo sem leitura, inclusive para quem só decide", () => {
        expect(getAvailableAdminModules([{ module: "BILLING", actions: ["PAYMENT_CONFIRM"] }])).toEqual([]);
        expect(hasAnyAdminAccess([])).toBe(false);
    });

    it("preserva os módulos de pagamentos e publicações com acesso independente", async () => {
        const permissions = [{ module: "PUBLICATIONS", actions: ["NOTICE_READ"] }];
        verify.mockResolvedValue(permissions);
        expect(getAvailableAdminModules(permissions).map(module => module.href)).toEqual(["/admin/publications"]);
        await expect(haveRoutePermissions({ pathname: "/admin/publications", permissionsToken: "signed", onCatch: jest.fn() })).resolves.toBe(true);
        await expect(haveRoutePermissions({ pathname: "/admin/pagamentos", permissionsToken: "signed", onCatch: jest.fn() })).resolves.toBe(false);

        const combined = [...permissions, { module: "BILLING", actions: ["PAYMENT_READ"] }];
        expect(getAvailableAdminModules(combined).map(module => module.href)).toEqual(["/admin/pagamentos", "/admin/publications", "/admin/gestao-financeira"]);
    });

    it("nega a gestão de publicações para quem tem apenas leitura de pagamentos", async () => {
        verify.mockResolvedValue([{ module: "BILLING", actions: ["PAYMENT_READ"] }]);
        await expect(haveRoutePermissions({ pathname: "/admin/publications", permissionsToken: "signed", onCatch: jest.fn() })).resolves.toBe(false);
    });

    it("aciona o tratamento de sessão inválida quando a verificação falha", async () => {
        verify.mockRejectedValue(new Error("invalid token"));
        const expired = new Error("session expired");
        const onCatch = jest.fn(() => expired);
        await expect(haveRoutePermissions({ pathname: "/admin/pagamentos", permissionsToken: "invalid", onCatch })).rejects.toBe(expired);
        expect(onCatch).toHaveBeenCalledTimes(1);
    });
});
