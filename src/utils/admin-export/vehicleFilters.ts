export interface VehicleExportRecord {
    id: number;
    ownerId: number;
    brand: string;
    model: string;
    nickname: string | null;
    plate: string;
    towing: boolean | null;
    status: VehicleStatus;
}

export interface VehicleExportCriteria {
    vehicleId: string;
    ownerId: string;
    model: string;
    plate: string;
    towing: "ALL" | "YES" | "NO";
    status: VehicleStatus | "ALL";
}

/** Filters the full administrative vehicle dataset before either CSV or PDF generation. */
export function filterAdminVehicleRecords<T extends VehicleExportRecord>(rows: T[], filters: VehicleExportCriteria) {
    const normalize = (value: string) => value.trim().toLocaleLowerCase("pt-BR");
    const plate = filters.plate.replace(/[^a-zA-Z0-9]/g, "").toLocaleUpperCase("pt-BR");
    return rows.filter((vehicle) => {
        if (filters.vehicleId && vehicle.id !== Number(filters.vehicleId)) return false;
        if (filters.ownerId && vehicle.ownerId !== Number(filters.ownerId)) return false;
        if (filters.model && !normalize(`${vehicle.brand} ${vehicle.model} ${vehicle.nickname ?? ""}`).includes(normalize(filters.model))) return false;
        if (plate && !vehicle.plate.toLocaleUpperCase("pt-BR").includes(plate)) return false;
        if (filters.towing === "YES" && vehicle.towing !== true) return false;
        if (filters.towing === "NO" && vehicle.towing !== false) return false;
        if (filters.status !== "ALL" && vehicle.status !== filters.status) return false;
        return true;
    });
}
