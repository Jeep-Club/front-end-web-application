import { getAvailableAdminModules, hasAnyAdminAccess } from "@/config/adminModules";
import { verifyPermissions } from "@/services/token/permissions";
import { haveRoutePermissions } from "@/utils/permission/routePermissions";

jest.mock("@/services/token/permissions", () => ({ verifyPermissions: jest.fn() }));

beforeEach(() => jest.resetAllMocks());

it("permite acessar a configuração financeira com leitura de associação, sem conceder permissões Billing", async () => {
    const permissions = [{ module: "MEMBERSHIP", actions: ["BILLING_CONFIGURATION_READ"] }];
    jest.mocked(verifyPermissions).mockResolvedValue(permissions);
    expect(getAvailableAdminModules(permissions).map(item => item.key)).toEqual(["financial-overview"]);
    expect(hasAnyAdminAccess(permissions)).toBe(true);
    await expect(haveRoutePermissions({ pathname: "/admin/gestao-financeira", permissionsToken: "test", onCatch: jest.fn() })).resolves.toBe(true);
    await expect(haveRoutePermissions({ pathname: "/admin/pagamentos", permissionsToken: "test", onCatch: jest.fn() })).resolves.toBe(false);
});

it("não transforma permissão de alteração em permissão de leitura", async () => {
    const permissions = [{ module: "MEMBERSHIP", actions: ["BILLING_CONFIGURATION_UPDATE"] }];
    jest.mocked(verifyPermissions).mockResolvedValue(permissions);
    expect(getAvailableAdminModules(permissions)).toEqual([]);
    await expect(haveRoutePermissions({ pathname: "/admin/gestao-financeira", permissionsToken: "test", onCatch: jest.fn() })).resolves.toBe(false);
});

it.each(["CHARGE_DEFINITION_READ", "CHARGE_CYCLE_READ", "MEMBER_CHARGE_READ", "PAYMENT_READ", "REFUND_READ"])("preserva o acesso financeiro de Billing por %s", async action => {
    const permissions = [{ module: "BILLING", actions: [action] }];
    jest.mocked(verifyPermissions).mockResolvedValue(permissions);
    const section = action === "CHARGE_DEFINITION_READ" || action === "CHARGE_CYCLE_READ" ? "financial-charges" : "financial-movements";
    expect(getAvailableAdminModules(permissions).map(item => item.key)).toEqual(["financial-overview", section]);
    await expect(haveRoutePermissions({ pathname: "/admin/gestao-financeira", permissionsToken: "test", onCatch: jest.fn() })).resolves.toBe(true);
});
