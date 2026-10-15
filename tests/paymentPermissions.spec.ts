import { verifyWithSchema } from "@/services/token/verify";
import { haveRoutePermissions } from "@/utils/permission/routePermissions";
import { getAvailableAdminModules, hasAnyAdminAccess } from "@/config/adminModules";

jest.mock("@/services/token/verify", () => ({ verifyWithSchema: jest.fn() }));
const verifyPermissions = jest.mocked(verifyWithSchema);

describe("visibilidade e acesso à análise de pagamentos", () => {
    it.each(["/admin/pagamentos", "/admin/pagamentos/12"])("permite leitura em %s", async pathname => {
        verifyPermissions.mockResolvedValue([{ module: "BILLING", actions: ["PAYMENT_READ"] }]);
        await expect(haveRoutePermissions({ pathname, permissionsToken: "signed", onCatch: jest.fn() })).resolves.toBe(true);
    });

    it.each(["/admin/pagamentos", "/admin/pagamentos/12"])("nega %s quando há somente decisão", async pathname => {
        verifyPermissions.mockResolvedValue([{ module: "BILLING", actions: ["PAYMENT_CONFIRM", "PAYMENT_REJECT"] }]);
        await expect(haveRoutePermissions({ pathname, permissionsToken: "signed", onCatch: jest.fn() })).resolves.toBe(false);
    });

    it("exibe o módulo e o painel administrativo para quem tem apenas leitura de pagamentos", () => {
        const permissions = [{ module: "BILLING", actions: ["PAYMENT_READ"] }];
        expect(getAvailableAdminModules(permissions).map(module => module.href)).toEqual(["/admin/pagamentos"]);
        expect(hasAnyAdminAccess(permissions)).toBe(true);
    });

    it("oculta o módulo sem leitura, inclusive para quem só decide", () => {
        expect(getAvailableAdminModules([{ module: "BILLING", actions: ["PAYMENT_CONFIRM"] }])).toEqual([]);
        expect(hasAnyAdminAccess([])).toBe(false);
    });
});
