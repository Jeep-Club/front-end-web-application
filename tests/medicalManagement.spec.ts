import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MedicalManagement from "@/components/pages/admin/medical-profiles/Management";
import { useUserStore } from "@/stores/userStore";
import { putMedicalProfileRequestSchema, getMedicalProfileResponseSchema } from "@/schemas/admin/medical-profile";

jest.mock("@/server/actions/admin/medical-profile/manage", () => ({ listMedicalProfilesAction: jest.fn(), getMedicalProfileAdminAction: jest.fn(), deleteMedicalProfileAction: jest.fn(), exportMedicalProfilesAction: jest.fn() }));
jest.mock("@/server/actions/admin/medical-profile/put", () => ({ putMedicalProfileAction: jest.fn() }));
jest.mock("@/server/actions/profile/medical-profile", () => ({ saveMedicalProfileAction: jest.fn() }));
jest.mock("@/server/actions/admin/users/options", () => ({ listUserOptionsAction: jest.fn() }));
jest.mock("@/providers/ModalProvider", () => ({ useModal: () => ({ setContent: jest.fn(), setOpen: jest.fn(), setClose: jest.fn() }) }));
jest.mock("@/stores/userStore", () => ({ useUserStore: jest.fn() }));

function render(actions: string[]) {
    const permissions = [{ module: "HEALTH", actions }];
    jest.mocked(useUserStore).mockReturnValue(permissions);
    const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false, gcTime: Infinity } } });
    client.setQueryData(["admin", "medical-profiles", "list", { pageIndex: 0, pageSize: 10 }, permissions], {
        content: [{ id: 3, ownerType: "DEPENDENT", ownerId: 7, updatedAt: "2026-10-28T12:00:00Z" }], totalPages: 1, totalElements: 1,
    });
    const html = renderToStaticMarkup(createElement(QueryClientProvider, { client }, createElement(MedicalManagement)));
    client.clear();
    return html;
}

describe("medical management permissions", () => {
    it("shows only consultation for read permission", () => {
        const html = render(["MEDICAL_PROFILE_READ"]);
        expect(html).toContain("Visualizar perfil 3");
        expect(html).not.toContain("Editar perfil");
        expect(html).not.toContain("Excluir perfil");
        expect(html).not.toContain("Cadastrar perfil");
        expect(html).not.toContain("Exportar CSV");
    });
    it.each([
        ["MEDICAL_PROFILE_UPDATE", "Editar perfil 3", "Cadastrar perfil"],
        ["MEDICAL_PROFILE_DELETE", "Excluir perfil 3", "Confirm"],
        ["MEDICAL_PROFILE_EXPORT", "Exportar CSV", "Exportar PDF"],
    ])("shows authorized actions for %s", (permission, label, second) => {
        const html = render(["MEDICAL_PROFILE_READ", permission]);
        expect(html).toContain(label);
        if (permission !== "MEDICAL_PROFILE_DELETE") expect(html).toContain(second);
        if (permission !== "MEDICAL_PROFILE_UPDATE") expect(html).not.toContain("Editar perfil");
        if (permission !== "MEDICAL_PROFILE_DELETE") expect(html).not.toContain("Excluir perfil");
        if (permission !== "MEDICAL_PROFILE_EXPORT") expect(html).not.toContain("Exportar CSV");
    });
    it("does not expose the listing or mutation buttons without read permission", () => {
        const html = render(["MEDICAL_PROFILE_UPDATE", "MEDICAL_PROFILE_DELETE", "MEDICAL_PROFILE_EXPORT"]);
        expect(html).toContain("Acesso não permitido");
        expect(html).not.toContain("Visualizar perfil");
        expect(html).not.toContain("Cadastrar perfil");
        expect(html).not.toContain("Exportar CSV");
    });
});

describe("backend medical contract", () => {
    const empty = { bloodType: "UNKNOWN", allergies: "", chronicConditions: "", continuousMedications: "", observations: "", healthInsuranceProvider: "", healthInsurancePlan: "", healthInsuranceNumber: "", emergencyContactName: "", emergencyContactPhone: "", emergencyContactRelationship: "" };
    it("accepts optional clinical data and rejects invalid blood type, phone and oversized fields", () => {
        expect(putMedicalProfileRequestSchema.safeParse(empty).success).toBe(true);
        expect(putMedicalProfileRequestSchema.safeParse({ ...empty, bloodType: "O+" }).success).toBe(false);
        expect(putMedicalProfileRequestSchema.safeParse({ ...empty, emergencyContactPhone: "123" }).success).toBe(false);
        expect(putMedicalProfileRequestSchema.safeParse({ ...empty, emergencyContactPhone: "(12) 99999-9999" }).success).toBe(true);
        expect(putMedicalProfileRequestSchema.safeParse({ ...empty, allergies: "a".repeat(2001) }).success).toBe(false);
    });
    it("reads nullable fields returned by the backend", () => {
        const result = getMedicalProfileResponseSchema.parse({ ...empty, id: 1, ownerType: "USER", ownerId: 2, allergies: null, emergencyContactPhone: null, createdAt: "2026-10-28T12:00:00Z", updatedAt: "2026-10-28T12:00:00Z" });
        expect(result.allergies).toBe("");
        expect(result.emergencyContactPhone).toBe("");
    });
});
