import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import {
    getMembershipBillingConfigurationAction,
    updateMembershipBillingConfigurationAction,
} from "@/server/actions/admin/membership/billingConfiguration";

jest.mock("@/services/fetchWrapper/actionFetchWrapper", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("@/utils/permission/actionPermissions", () => ({ haveActionPermission: jest.fn() }));

const request = jest.mocked(actionFetchWrapper);
const permission = jest.mocked(haveActionPermission);
const configuration = (enforcementEnabled: boolean) => ({
    id: 7,
    chargeDefinitionId: 12,
    enforcementEnabled,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: null,
});

beforeEach(() => {
    jest.resetAllMocks();
    permission.mockResolvedValue(true);
});

it("retorna null quando a configuração ainda não existe (204)", async () => {
    request.mockResolvedValue({ status: 204, data: null });

    await expect(getMembershipBillingConfigurationAction()).resolves.toBeNull();
    expect(permission).toHaveBeenCalledWith("MEMBERSHIP", "BILLING_CONFIGURATION_READ");
    expect(request).toHaveBeenCalledWith(expect.objectContaining({
        url: "admin/membership-billing-configuration", method: "GET", cache: "no-store",
    }));
});

it("retorna configuração encontrada", async () => {
    const current = configuration(true);
    request.mockResolvedValue({ status: 200, data: current });

    await expect(getMembershipBillingConfigurationAction()).resolves.toEqual(current);
});

it.each([
    ["BILLING_CONFIGURATION_READ", () => getMembershipBillingConfigurationAction()],
    ["BILLING_CONFIGURATION_UPDATE", () => updateMembershipBillingConfigurationAction({ chargeDefinitionId: 12 })],
] as const)("bloqueia sem permissão %s antes de chamar a API", async (action, execute) => {
    permission.mockResolvedValue(false);

    await expect(execute()).rejects.toThrow("permissão");
    expect(permission).toHaveBeenCalledWith("MEMBERSHIP", action);
    expect(request).not.toHaveBeenCalled();
});

it.each([
    [0], [-1], [1.5], ["12; DROP TABLE billing"], ["12"],
] as const)("rejeita ID de cobrança inválido ou injetado (%s) sem buscar ou atualizar", async chargeDefinitionId => {
    await expect(updateMembershipBillingConfigurationAction({ chargeDefinitionId } as never)).rejects.toThrow();
    expect(request).not.toHaveBeenCalled();
});

it("rejeita enforcementEnabled fornecido pelo cliente", async () => {
    await expect(updateMembershipBillingConfigurationAction({ chargeDefinitionId: 12, enforcementEnabled: true } as never)).rejects.toThrow();
    expect(request).not.toHaveBeenCalled();
});

it.each([true, false])("preserva enforcementEnabled=%s ao atualizar configuração existente", async enforcementEnabled => {
    const current = configuration(enforcementEnabled);
    request.mockResolvedValueOnce({ status: 200, data: current }).mockResolvedValueOnce({ status: 200, data: current });

    await expect(updateMembershipBillingConfigurationAction({ chargeDefinitionId: 23 })).resolves.toEqual(current);
    expect(request).toHaveBeenNthCalledWith(1, expect.objectContaining({ method: "GET" }));
    expect(request).toHaveBeenNthCalledWith(2, expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ chargeDefinitionId: 23, enforcementEnabled }),
    }));
});

it("inicia a primeira configuração com enforcement desabilitado", async () => {
    const saved = configuration(false);
    request.mockResolvedValueOnce({ status: 204, data: null }).mockResolvedValueOnce({ status: 200, data: saved });

    await expect(updateMembershipBillingConfigurationAction({ chargeDefinitionId: 23 })).resolves.toEqual(saved);
    expect(request).toHaveBeenNthCalledWith(2, expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ chargeDefinitionId: 23, enforcementEnabled: false }),
    }));
});

it("não tenta PUT quando a leitura atual falha", async () => {
    request.mockRejectedValueOnce(new Error("falha no GET"));

    await expect(updateMembershipBillingConfigurationAction({ chargeDefinitionId: 23 })).rejects.toThrow("falha no GET");
    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ method: "GET" }));
});

it("propaga falha do PUT sem retornar sucesso", async () => {
    request.mockResolvedValueOnce({ status: 204, data: null }).mockRejectedValueOnce(new Error("falha no PUT"));

    await expect(updateMembershipBillingConfigurationAction({ chargeDefinitionId: 23 })).rejects.toThrow("falha no PUT");
    expect(request).toHaveBeenCalledTimes(2);
    expect(request).toHaveBeenLastCalledWith(expect.objectContaining({ method: "PUT" }));
});
