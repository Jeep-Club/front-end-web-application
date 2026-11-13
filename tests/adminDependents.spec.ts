import { toActionError } from "@/utils/http/apiError";
jest.mock("@/services/token/permissions", () => ({}));
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import {
    listDependentsAdminAction,
    listDependentsByUserAdminAction,
} from "@/server/actions/admin/dependents/list";
import { getDependentDetailAdminAction } from "@/server/actions/admin/dependents/detail";
import {
    archiveDependentAdminAction,
    disableDependentAdminAction,
    enableDependentAdminAction,
    unarchiveDependentAdminAction,
} from "@/server/actions/admin/dependents/lifecycle";
import { deleteDependentAdminAction } from "@/server/actions/admin/dependents/delete";
import {
    removeDependentPhotoAdminAction,
    replaceDependentPhotoAdminAction,
} from "@/server/actions/admin/dependents/photo";
import { exportAdminDependentsAction } from "@/server/actions/admin/dependents/export";
import { adminModules, canAccessAdminModule } from "@/config/adminModules";
import { routePermissions } from "@/utils/permission/routePermissions";
import { HttpAPIRoutes } from "@/utils/http/api";
import {
    formatDependentBirthDate,
    formatDependentCpf,
    formatDependentPhone,
    getAdminDependentPhotoUrl,
} from "@/components/pages/admin/dependentes/dependentDisplay";

jest.mock("@/services/fetchWrapper/actionFetchWrapper", () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock("@/utils/permission/actionPermissions", () => ({
    haveActionPermission: jest.fn(),
}));

jest.mock("@/server/utils/adminExportPdf", () => ({
    getAdminPdfIdentity: jest.fn().mockResolvedValue({
        exportedBy: "Admin Teste",
        seal: null,
    }),
}));

const request = jest.mocked(actionFetchWrapper);
const checkPermission = jest.mocked(haveActionPermission);

beforeEach(() => {
    jest.resetAllMocks();
});

describe("Admin Dependents Management", () => {
    it("registers the dependents admin module and route permissions for DEPENDENTS_DEPENDENT_READ", () => {
        const dependentsModule = adminModules.find((m) => m.key === "dependents");
        expect(dependentsModule).toBeDefined();
        expect(dependentsModule?.href).toBe("/admin/dependentes");
        expect(
            canAccessAdminModule(
                [{ module: "DEPENDENTS", actions: ["DEPENDENT_READ"] }],
                dependentsModule!,
            ),
        ).toBe(true);
        expect(
            canAccessAdminModule(
                [{ module: "DEPENDENTS", actions: ["DEPENDENT_ACTIVATE"] }],
                dependentsModule!,
            ),
        ).toBe(false);
        expect(routePermissions["/admin/dependentes"]).toEqual([
            { module: "DEPENDENTS", actions: ["DEPENDENT_READ"] },
        ]);
        expect(routePermissions["/admin/dependents"]).toEqual([
            { module: "DEPENDENTS", actions: ["DEPENDENT_READ"] },
        ]);
    });

    it("lists dependents with pagination and filters via GET admin/dependents", async () => {
        const sampleItem: AdminDependentItem = {
            id: 10,
            name: "Pedro Silva",
            cpf: "52998224725",
            birthDate: "2012-05-20",
            relationshipType: "CHILD",
            phoneNumber: "11988887777",
            userId: 5,
            ownerName: "João Silva",
            status: "ACTIVE",
            createdAt: "2026-06-30T12:00:00Z",
            updatedAt: null,
            photoUrl: "/users/5/dependents/10/photo",
        };

        request.mockResolvedValueOnce({
            status: 200,
            data: {
                content: [sampleItem],
                totalElements: 1,
                totalPages: 1,
                number: 0,
                size: 10,
                first: true,
                last: true,
                numberOfElements: 1,
                empty: false,
            },
        });

        const page = await listDependentsAdminAction({
            page: 0,
            size: 10,
            q: "  Pedro  ",
            relationshipType: "CHILD",
            status: "ACTIVE",
            userId: 5,
        });

        expect(request).toHaveBeenCalledWith(
            expect.objectContaining({
                url: `${HttpAPIRoutes.ADMIN_DEPENDENTS_LIST}?page=0&size=10&q=Pedro&userId=5&relationshipType=CHILD&status=ACTIVE`,
                method: "GET",
            }),
        );
        expect(page.content).toEqual([sampleItem]);

        request.mockResolvedValueOnce({
            status: 200,
            data: [sampleItem],
        });
        await expect(listDependentsByUserAdminAction(5)).resolves.toEqual([sampleItem]);
        expect(request).toHaveBeenLastCalledWith(
            expect.objectContaining({
                url: "users/5/dependents",
                method: "GET",
            }),
        );
    });

    it("executes detail, enable, disable, archive, unarchive, photo, and delete actions", async () => {
        const sampleItem: AdminDependentItem = {
            id: 10,
            name: "Pedro Silva",
            cpf: "52998224725",
            birthDate: "2012-05-20",
            relationshipType: "CHILD",
            phoneNumber: "11988887777",
            userId: 5,
            ownerName: "João Silva",
            status: "ACTIVE",
            createdAt: "2026-06-30T12:00:00Z",
            updatedAt: "2026-06-30T13:00:00Z",
            photoUrl: "/users/5/dependents/10/photo",
        };

        request.mockResolvedValueOnce({ status: 200, data: sampleItem });
        await expect(getDependentDetailAdminAction(10)).resolves.toEqual(sampleItem);
        expect(request).toHaveBeenLastCalledWith(
            expect.objectContaining({
                url: "admin/dependents/10",
                method: "GET",
            }),
        );

        request.mockResolvedValueOnce({
            status: 200,
            data: { ...sampleItem, status: "INACTIVE" },
        });
        await expect(disableDependentAdminAction(5, 10)).resolves.toEqual({
            ...sampleItem,
            status: "INACTIVE",
        });
        expect(request).toHaveBeenLastCalledWith(
            expect.objectContaining({
                url: "users/5/dependents/10/disable",
                method: "PATCH",
            }),
        );

        request.mockResolvedValueOnce({
            status: 200,
            data: { ...sampleItem, status: "ACTIVE" },
        });
        await expect(enableDependentAdminAction(5, 10)).resolves.toEqual({
            ...sampleItem,
            status: "ACTIVE",
        });
        expect(request).toHaveBeenLastCalledWith(
            expect.objectContaining({
                url: "users/5/dependents/10/enable",
                method: "PATCH",
            }),
        );

        request.mockResolvedValueOnce({
            status: 200,
            data: { ...sampleItem, status: "ARCHIVED" },
        });
        await expect(archiveDependentAdminAction(5, 10)).resolves.toEqual({
            ...sampleItem,
            status: "ARCHIVED",
        });
        expect(request).toHaveBeenLastCalledWith(
            expect.objectContaining({
                url: "users/5/dependents/10/archive",
                method: "PATCH",
            }),
        );

        request.mockResolvedValueOnce({
            status: 200,
            data: { ...sampleItem, status: "INACTIVE" },
        });
        await expect(unarchiveDependentAdminAction(5, 10)).resolves.toEqual({
            ...sampleItem,
            status: "INACTIVE",
        });
        expect(request).toHaveBeenLastCalledWith(
            expect.objectContaining({
                url: "users/5/dependents/10/unarchive",
                method: "PATCH",
            }),
        );

        const validPhoto = new File(["img-bytes"], "photo.jpg", { type: "image/jpeg" });
        const form = new FormData();
        form.set("photo", validPhoto);
        request.mockResolvedValueOnce({ status: 200, data: sampleItem });
        await expect(replaceDependentPhotoAdminAction(5, 10, form)).resolves.toEqual(
            sampleItem,
        );
        expect(request).toHaveBeenLastCalledWith(
            expect.objectContaining({
                url: "users/5/dependents/10/photo",
                method: "PATCH",
            }),
        );

        const invalidForm = new FormData();
        invalidForm.set("photo", new File(["pdf"], "doc.pdf", { type: "application/pdf" }));
        await expect(replaceDependentPhotoAdminAction(5, 10, invalidForm)).rejects.toThrow(
            "Use uma foto JPEG, PNG ou WebP.",
        );

        request.mockResolvedValueOnce({
            status: 200,
            data: { ...sampleItem, photoUrl: null },
        });
        await expect(removeDependentPhotoAdminAction(5, 10)).resolves.toEqual({
            ...sampleItem,
            photoUrl: null,
        });
        expect(request).toHaveBeenLastCalledWith(
            expect.objectContaining({
                url: "users/5/dependents/10/photo",
                method: "DELETE",
            }),
        );

        request.mockResolvedValueOnce({ status: 204, data: undefined });
        await expect(deleteDependentAdminAction(5, 10)).resolves.toBeUndefined();
        expect(request).toHaveBeenLastCalledWith(
            expect.objectContaining({
                url: "users/5/dependents/10",
                method: "DELETE",
            }),
        );
    });

    it("exports dependents in CSV and PDF formats and enforces DEPENDENTS_DEPENDENT_EXPORT", async () => {
        checkPermission.mockResolvedValueOnce(false);
        await expect(
            exportAdminDependentsAction({ format: "CSV" }),
        ).rejects.toThrow("Acesso não permitido para exportar dependentes.");

        checkPermission.mockResolvedValueOnce(true);
        const csvBlob = new Blob(["ID;Nome;CPF\r\n10;Pedro Silva;52998224725\r\n"], {
            type: "text/csv;charset=UTF-8",
        });
        request.mockResolvedValueOnce({
            status: 200,
            data: csvBlob,
            contentDisposition: 'attachment; filename="dependentes.csv"',
        });

        const exportedCsv = await exportAdminDependentsAction({
            format: "CSV",
            name: "Pedro",
            status: "ACTIVE",
        });
        expect(request).toHaveBeenLastCalledWith(
            expect.objectContaining({
                url: "admin/dependents/export?format=CSV&name=Pedro&status=ACTIVE",
                method: "GET",
                responseType: "blob",
            }),
        );
        expect(exportedCsv.filename).toBe("dependentes.csv");
        expect(exportedCsv.contentType).toContain("text/csv");

        checkPermission.mockResolvedValueOnce(true);
        request.mockResolvedValueOnce({
            status: 200,
            data: csvBlob,
            contentDisposition: 'attachment; filename="dependentes-historico.csv"',
        });
        const exportedHistory = await exportAdminDependentsAction({
            format: "CSV",
            history: true,
        });
        expect(request).toHaveBeenLastCalledWith(
            expect.objectContaining({
                url: "admin/dependents/history/export?format=CSV",
                method: "GET",
            }),
        );
        expect(exportedHistory.filename).toBe("dependentes-historico.csv");
    });

    it("translates dependent domain errors and formats display fields properly", async () => {
        request.mockRejectedValueOnce(
            toActionError({
                status: 409,
                rawData: {
                    code: "DEPENDENT_LIFECYCLE_CONFLICT",
                    status: 409,
                    detail: "Dependent has operational Event participation.",
                },
            }),
        );
        await expect(disableDependentAdminAction(5, 10)).rejects.toThrow(
            "Este dependente possui participação ativa em evento não encerrado.",
        );

        expect(formatDependentCpf("52998224725")).toBe("529.982.247-25");
        expect(formatDependentPhone("11988887777")).toBe("(11) 98888-7777");
        expect(formatDependentBirthDate("2012-05-20")).toBe("20/05/2012");
        expect(
            getAdminDependentPhotoUrl({
                id: 10,
                userId: 5,
                photoUrl: "/users/5/dependents/10/photo",
                updatedAt: "2026-06-30T12:00:00Z",
            }),
        ).toBe("/api/admin/users/5/dependents/10/photo?v=2026-06-30T12%3A00%3A00Z");
        expect(
            getAdminDependentPhotoUrl({
                id: 10,
                userId: 5,
                photoUrl: null,
                updatedAt: null,
            }),
        ).toBeNull();
    });
});
