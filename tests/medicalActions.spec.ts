jest.mock("@/services/fetchWrapper/actionFetchWrapper", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("@/utils/permission/actionPermissions", () => ({ haveActionPermission: jest.fn() }));

import fetchAction from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { listMedicalProfilesAction, getMedicalProfileAdminAction, deleteMedicalProfileAction, exportMedicalProfilesAction } from "@/server/actions/admin/medical-profile/manage";
import { putMedicalProfileAction } from "@/server/actions/admin/medical-profile/put";

const data: PutMedicalProfile = { bloodType: "UNKNOWN", allergies: "", chronicConditions: "", continuousMedications: "", observations: "", healthInsuranceProvider: "", healthInsurancePlan: "", healthInsuranceNumber: "", emergencyContactName: "", emergencyContactPhone: "", emergencyContactRelationship: "" };
beforeEach(() => { jest.clearAllMocks(); jest.mocked(haveActionPermission).mockResolvedValue(true); jest.mocked(fetchAction).mockResolvedValue({ status: 200, data: { id: 1 } }); });

describe("medical server authorization and API routes", () => {
    it.each([
        ["MEDICAL_PROFILE_READ", () => listMedicalProfilesAction()],
        ["MEDICAL_PROFILE_READ", () => getMedicalProfileAdminAction(1)],
        ["MEDICAL_PROFILE_UPDATE", () => putMedicalProfileAction({ id: 2, ownerType: "USER", data })],
        ["MEDICAL_PROFILE_DELETE", () => deleteMedicalProfileAction(1)],
        ["MEDICAL_PROFILE_EXPORT", () => exportMedicalProfilesAction("CSV")],
    ] as const)("blocks requests without %s", async (permission, operation) => {
        jest.mocked(haveActionPermission).mockResolvedValue(false);
        expect((await operation()).ok).toBe(false);
        expect(haveActionPermission).toHaveBeenCalledWith("HEALTH", permission);
        expect(fetchAction).not.toHaveBeenCalled();
    });
    it("paginates through the administrative API without cache", async () => {
        await listMedicalProfilesAction(2, 20);
        expect(fetchAction).toHaveBeenCalledWith(expect.objectContaining({ url: "admin/medical-profiles?page=2&size=20&sort=id,desc", cache: "no-store" }));
    });
    it.each([['USER', 'users'], ['DEPENDENT', 'dependents']])("saves %s by owner ID", async (ownerType, path) => {
        await putMedicalProfileAction({ id: 7, ownerType, data });
        expect(fetchAction).toHaveBeenCalledWith(expect.objectContaining({ url: `admin/medical-profiles/${path}/7`, method: "PUT" }));
        expect(JSON.parse(jest.mocked(fetchAction).mock.calls[0][0].body as string)).toEqual(data);
    });
    it("rejects invalid owner types rather than defaulting to users", async () => {
        expect((await putMedicalProfileAction({ id: 7, ownerType: "INVALID", data })).ok).toBe(false);
        expect(fetchAction).not.toHaveBeenCalled();
    });
    it("deletes by profile ID", async () => {
        await deleteMedicalProfileAction(5);
        expect(fetchAction).toHaveBeenCalledWith(expect.objectContaining({ url: "admin/medical-profiles/5", method: "DELETE" }));
    });
    it("downloads selected profiles and deletion history from separate endpoints", async () => {
        jest.mocked(fetchAction).mockResolvedValue({ status: 200, data: new Blob(["report"], { type: "application/pdf" }) });
        const result = await exportMedicalProfilesAction("PDF", 5);
        expect(result.ok).toBe(true);
        expect(fetchAction).toHaveBeenLastCalledWith(expect.objectContaining({ url: "admin/medical-profiles/export?format=PDF&profileId=5", responseType: "blob", cache: "no-store" }));
        await exportMedicalProfilesAction("CSV", undefined, true);
        expect(fetchAction).toHaveBeenLastCalledWith(expect.objectContaining({ url: "admin/medical-profiles/history/export?format=CSV" }));
    });
});
