import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { exportAdminPublicationsAction } from "@/server/actions/publications/export";

jest.mock("@/services/fetchWrapper/actionFetchWrapper", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("@/utils/permission/actionPermissions", () => ({ haveActionPermission: jest.fn() }));

it("uses the API CSV export with the requested type and editorial status", async () => {
    jest.mocked(haveActionPermission).mockResolvedValue(true);
    jest.mocked(actionFetchWrapper).mockResolvedValue({
        status: 200,
        data: new Blob(["Title,Content"], { type: "text/csv" }),
        contentDisposition: 'attachment; filename="avisos-draft.csv"',
    });

    const file = await exportAdminPublicationsAction({ type: "NOTICE", status: "DRAFT" });

    expect(actionFetchWrapper).toHaveBeenCalledWith(expect.objectContaining({
        url: "admin/notices/export?format=CSV&status=DRAFT",
        responseType: "blob",
        allowedContentTypes: ["text/csv"],
    }));
    expect(file.filename).toBe("avisos-draft.csv");
    expect(Buffer.from(file.base64, "base64").toString()).toBe("Title,Content");
});

it("does not request a file without both export and type-read permission", async () => {
    jest.mocked(actionFetchWrapper).mockClear();
    jest.mocked(haveActionPermission).mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    await expect(exportAdminPublicationsAction({ type: "EVENT", status: "ALL" })).rejects.toThrow("permissão");
    expect(actionFetchWrapper).not.toHaveBeenCalled();
});
