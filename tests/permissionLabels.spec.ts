import { getAdministrativePermissions, getModuleLabel, getPermissionNameByCode, isMemberPermission } from "@/components/pages/admin/roles-permissoe/permissionLabels";

describe("Membership permission catalog", () => {
    it("hides baseline access while retaining administrative Membership permissions without mutating the catalog", () => {
        const catalog = [
            { id: 1, code: "PUBLICATIONS_EVENT_READ", module: "PUBLICATIONS", description: "Read events" },
            { id: 2, code: "MEMBERSHIP_MEMBER_REGISTRATION_MANAGE", module: "MEMBERSHIP", description: "Manage registration" },
            { id: 3, code: "PUBLICATIONS_EVENT_READ_ADMIN", module: "PUBLICATIONS", description: "Read administrative events" },
            { id: 4, code: "PUBLICATIONS_SERVICE_REQUEST_READ", module: "PUBLICATIONS", description: "Read own requests" },
        ];
        expect(getAdministrativePermissions(catalog)).toEqual([catalog[1], catalog[2]]);
        expect(catalog).toHaveLength(4);
    });

    it("groups membership separately under Membritude", () => {
        expect(getModuleLabel("MEMBERSHIP")).toBe("Membritude");
        expect(getModuleLabel("IDENTITY")).toBe("Usuários");
    });

    it.each([
        ["MEMBERSHIP_MEMBER_READ", "Consultar matrículas"],
        ["MEMBERSHIP_MEMBER_AUDIT_READ", "Consultar auditoria de matrículas"],
        ["MEMBERSHIP_MEMBER_NUMBER_RESERVE", "Reservar números de matrícula permanentemente"],
        ["MEMBERSHIP_MEMBER_NUMBER_ISSUE", "Emitir matrículas administrativamente"],
        ["MEMBERSHIP_MEMBER_IMPORT", "Simular e aplicar conciliação histórica autorizada"],
        ["MEMBERSHIP_MEMBER_REGISTRATION_MANAGE", "Atribuir e retificar matrículas"],
        ["MEMBERSHIP_EXPORT", "Exportar associados"],
        ["MEMBERSHIP_MEMBERSHIP_APPLICANT_UNBLOCK", "Desbloquear solicitantes"],
        ["MEMBERSHIP_MEMBERSHIP_REQUEST_READ", "Consultar solicitações de adesão"],
        ["MEMBERSHIP_MEMBERSHIP_REQUEST_APPROVE", "Aprovar solicitações de adesão"],
        ["MEMBERSHIP_MEMBERSHIP_REQUEST_REJECT", "Rejeitar solicitações de adesão"],
        ["MEMBERSHIP_MEMBERSHIP_REQUEST_INVITE_RESEND", "Reenviar convite de adesão"],
        ["MEMBERSHIP_MEMBERSHIP_APPLICANT_BLOCK", "Bloquear CPF de solicitante"],
        ["MEMBERSHIP_BILLING_CONFIGURATION_READ", "Consultar cobrança de referência da associação"],
        ["MEMBERSHIP_BILLING_CONFIGURATION_UPDATE", "Configurar cobrança de referência da associação"],
    ])("names %s without a scope prefix", (code, label) => {
        expect(getPermissionNameByCode(code)).toBe(label);
        expect(isMemberPermission(code)).toBe(false);
    });

    it("distinguishes own service requests from administrative access", () => {
        expect(getPermissionNameByCode("PUBLICATIONS_SERVICE_REQUEST_READ")).toBe("Consultar solicitações próprias de serviço");
        expect(getPermissionNameByCode("PUBLICATIONS_SERVICE_REQUEST_ADMIN_READ")).toBe("Consultar solicitações de serviço administrativamente");
    });
});
