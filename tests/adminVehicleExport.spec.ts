import { filterAdminVehicleRecords } from "@/utils/admin-export/vehicleFilters";
import { exportAdminVehiclesAction } from "@/server/actions/admin/vehicles/export";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { getAdminPdfIdentity } from "@/server/utils/adminExportPdf";
import { readFileSync } from "node:fs";

jest.mock("@/services/fetchWrapper/actionFetchWrapper", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("@/utils/permission/actionPermissions", () => ({ haveActionPermission: jest.fn() }));
jest.mock("@/server/utils/adminExportPdf", () => ({ getAdminPdfIdentity: jest.fn() }));

const vehicles = [
    { id: 1, ownerId: 21, brand: "Jeep", model: "Renegade", nickname: "Trilha", plate: "ABC1D23", towing: true, status: "ACTIVE" as const },
    { id: 2, ownerId: 21, brand: "Toyota", model: "Hilux", nickname: null, plate: "DEF4G56", towing: false, status: "ACTIVE" as const },
    { id: 3, ownerId: 32, brand: "Jeep", model: "Compass", nickname: null, plate: "GHI7J89", towing: null, status: "ARCHIVED" as const },
];

const emptyFilters = { vehicleId: "", ownerId: "", model: "", plate: "", towing: "ALL" as const, status: "ALL" as const };

const listedVehicle = { id: 1, nickname: "Trilha", plate: "ABC1D23", photo: null, modelYear: 2022, model: "Renegade", color: "Azul", status: "ACTIVE", ownerId: 21, ownerName: "Marina Silva" };
const page = { content: [listedVehicle], totalElements: 1, totalPages: 1, number: 0, size: 50, first: true, last: true, numberOfElements: 1, empty: false };
const detail = { ...listedVehicle, renavam: "12345678901", brand: "Jeep", manufacturingYear: 2021, seatingCapacity: 5, fuelType: "FLEX", engineDisplacement: 1.8, towing: true, createdAt: "2025-01-01T00:00:00Z", updatedAt: null, disabledAt: null };

beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(haveActionPermission).mockResolvedValue(true);
    jest.mocked(getAdminPdfIdentity).mockResolvedValue({ exportedBy: "Admin Jeep", seal: `data:image/png;base64,${readFileSync("public/images/jeepclube-emblema.png").toString("base64")}` });
    jest.mocked(actionFetchWrapper).mockImplementation(async ({ url }) => ({ status: 200, data: String(url).includes("list/admin") ? page : detail } as never));
});

it("filters exact vehicle/user IDs, partial model and normalized plate", () => {
    expect(filterAdminVehicleRecords(vehicles, { ...emptyFilters, vehicleId: "1" }).map((vehicle) => vehicle.id)).toEqual([1]);
    expect(filterAdminVehicleRecords(vehicles, { ...emptyFilters, ownerId: "21", model: "jeep ren", plate: "abc-1d23" }).map((vehicle) => vehicle.id)).toEqual([1]);
});

it("selects vehicles with or without towing and applies status filters", () => {
    expect(filterAdminVehicleRecords(vehicles, { ...emptyFilters, towing: "YES" }).map((vehicle) => vehicle.id)).toEqual([1]);
    expect(filterAdminVehicleRecords(vehicles, { ...emptyFilters, towing: "NO", status: "ACTIVE" }).map((vehicle) => vehicle.id)).toEqual([2]);
});

it("exports all matching vehicle detail fields to the branded PDF through authorized admin reads", async () => {
    const file = await exportAdminVehiclesAction("PDF", { ownerId: "21", towing: "YES" });
    expect(haveActionPermission).toHaveBeenCalledWith("VEHICLES", "VEHICLE_READ");
    expect(actionFetchWrapper).toHaveBeenCalledWith(expect.objectContaining({ url: "vehicles/list/admin?page=0&size=50" }));
    expect(actionFetchWrapper).toHaveBeenCalledWith(expect.objectContaining({ url: "vehicles/detail/admin/1" }));
    expect(file.contentType).toBe("application/pdf");
    expect(Buffer.from(file.base64, "base64").toString("latin1")).toMatch(/^%PDF-/);
});

it("returns a filtered CSV for users who select CSV", async () => {
    const file = await exportAdminVehiclesAction("CSV", { towing: "YES" });
    const csv = Buffer.from(file.base64, "base64").toString("utf8");
    expect(file.contentType).toContain("text/csv");
    expect(csv).toContain("ABC1D23");
    expect(csv).toContain("\"Sim\"");
});
