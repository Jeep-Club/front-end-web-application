"use server";

import { z } from "zod";

import { vehicleDetailResponseSchema } from "@/schemas/vehicles/detail";
import { listVehicleMemberResponseSchema, vehicleListItemSchema } from "@/schemas/vehicles/list";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { ActionError } from "@/utils/http/ActionError";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { HttpAPIRoutes } from "@/utils/http/api";
import { buildAdminTablePdfFile, type AdminExportTable } from "@/utils/admin-export/usersPdf";
import { FUEL_TYPE_LABEL, VEHICLE_STATUS_LABEL } from "@/components/pages/admin/veiculos/vehicleDisplay";
import { getAdminPdfIdentity } from "@/server/utils/adminExportPdf";
import { filterAdminVehicleRecords } from "@/utils/admin-export/vehicleFilters";

const idFilter = z.string().trim().max(16).refine((value) => !value || /^[1-9]\d*$/.test(value), "Informe um ID positivo válido.").refine((value) => !value || Number.isSafeInteger(Number(value)), "O ID informado é muito grande.").optional().default("");
const vehicleExportFilters = z.object({
    vehicleId: idFilter,
    ownerId: idFilter,
    model: z.string().trim().max(100).optional().default(""),
    plate: z.string().trim().max(8).optional().default(""),
    towing: z.enum(["ALL", "YES", "NO"]).optional().default("ALL"),
    status: z.enum(["ALL", "ACTIVE", "INACTIVE", "ARCHIVED"]).optional().default("ALL"),
});

type VehicleExportFilters = z.input<typeof vehicleExportFilters>;
type ListedVehicle = z.infer<typeof vehicleListItemSchema>;
type VehicleRow = {
    id: number; nickname: string | null; ownerName: string | null; ownerId: number; plate: string;
    renavam: string; brand: string; model: string; manufacturingYear: number; modelYear: number;
    color: string; seatingCapacity: number; fuelType: FuelType; engineDisplacement: number;
    towing: boolean | null; status: VehicleStatus; createdAt: string; updatedAt: string | null;
};

async function requireVehicleRead() {
    if (!await haveActionPermission("VEHICLES", "VEHICLE_READ")) throw new ActionError("Acesso não permitido para exportar veículos.");
}

async function listVehiclePage(page: number) {
    const response = await actionFetchWrapper({
        url: `${HttpAPIRoutes.VEHICLES_LIST_ADMIN}?page=${page}&size=50`,
        method: "GET",
        schema: listVehicleMemberResponseSchema,
        cache: "no-store",
    });
    return response.data;
}

async function getAllVehicleDetails(filters: z.output<typeof vehicleExportFilters>) {
    const first = await listVehiclePage(0);
    const pages: Awaited<ReturnType<typeof listVehiclePage>>[] = [];
    for (let page = 1; page < first.totalPages; page += 8) {
        const batch = await Promise.all(Array.from({ length: Math.min(8, first.totalPages - page) }, (_, index) => listVehiclePage(page + index)));
        pages.push(...batch);
    }
    const plateFilter = filters.plate.replace(/[^a-zA-Z0-9]/g, "").toLocaleUpperCase("pt-BR");
    const listed: ListedVehicle[] = [...first.content, ...pages.flatMap((page) => page.content)].filter((vehicle) => {
        if (filters.vehicleId && vehicle.id !== Number(filters.vehicleId)) return false;
        if (filters.ownerId && vehicle.ownerId !== Number(filters.ownerId)) return false;
        if (plateFilter && !vehicle.plate.toLocaleUpperCase("pt-BR").includes(plateFilter)) return false;
        if (filters.status !== "ALL" && vehicle.status !== filters.status) return false;
        return true;
    });
    const ownerNames = new Map(listed.map((vehicle) => [vehicle.id, vehicle.ownerName ?? null]));
    const details: VehicleRow[] = [];

    // Bound detail requests so a large club registry does not flood the API connection pool.
    for (let offset = 0; offset < listed.length; offset += 8) {
        const batch = listed.slice(offset, offset + 8);
        const results = await Promise.all(batch.map(async (vehicle) => {
            const response = await actionFetchWrapper({
                url: `${HttpAPIRoutes.VEHICLES_DETAIL_ADMIN}/${vehicle.id}`,
                method: "GET",
                schema: vehicleDetailResponseSchema,
                cache: "no-store",
            });
            return { ...response.data, ownerName: ownerNames.get(vehicle.id) ?? null };
        }));
        details.push(...results);
    }
    return details;
}

const columns = ["ID", "Apelido", "Proprietário", "ID do proprietário", "Marca", "Modelo", "Placa", "RENAVAM", "Ano fabricação", "Ano modelo", "Cor", "Assentos", "Combustível", "Cilindrada", "Guincho/reboque", "Situação", "Criado em", "Atualizado em"];

function toTable(rows: VehicleRow[]): AdminExportTable {
    return {
        columns,
        rows: rows.map((vehicle) => [
            String(vehicle.id), vehicle.nickname || "—", vehicle.ownerName || "—", String(vehicle.ownerId),
            vehicle.brand, vehicle.model, vehicle.plate, vehicle.renavam, String(vehicle.manufacturingYear),
            String(vehicle.modelYear), vehicle.color, String(vehicle.seatingCapacity), FUEL_TYPE_LABEL[vehicle.fuelType],
            `${vehicle.engineDisplacement.toLocaleString("pt-BR")} cc`, vehicle.towing === null ? "Não informado" : vehicle.towing ? "Sim" : "Não",
            VEHICLE_STATUS_LABEL[vehicle.status], vehicle.createdAt, vehicle.updatedAt ?? "—",
        ]),
    };
}

function serializeCsv(data: AdminExportTable) {
    const escape = (input: string) => {
        const safe = /^\s*[=+@-]/.test(input) ? `'${input}` : input;
        return `"${safe.replace(/"/g, '""')}"`;
    };
    return `\uFEFF${[data.columns, ...data.rows].map((row) => row.map(escape).join(";")).join("\r\n")}\r\n`;
}

function filterLabels(filters: z.output<typeof vehicleExportFilters>) {
    const result: string[] = [];
    if (filters.vehicleId) result.push(`Veículo ID: ${filters.vehicleId}`);
    if (filters.ownerId) result.push(`Usuário ID: ${filters.ownerId}`);
    if (filters.model) result.push(`Marca/modelo/apelido: ${filters.model}`);
    if (filters.plate) result.push(`Placa: ${filters.plate}`);
    if (filters.towing !== "ALL") result.push(`Guincho/reboque: ${filters.towing === "YES" ? "Sim" : "Não"}`);
    if (filters.status !== "ALL") result.push(`Situação: ${VEHICLE_STATUS_LABEL[filters.status]}`);
    return result;
}

/** Exports the vehicle registry using the existing admin read permission and paginated list/detail endpoints. */
export async function exportAdminVehiclesAction(format: "CSV" | "PDF", input: VehicleExportFilters = {}) {
    await requireVehicleRead();
    z.enum(["CSV", "PDF"]).parse(format);
    const filters = vehicleExportFilters.parse(input);
    const rows = filterAdminVehicleRecords(await getAllVehicleDetails(filters), filters);
    const table = toTable(rows);
    const date = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
    if (format === "CSV") {
        return {
            base64: Buffer.from(serializeCsv(table), "utf8").toString("base64"),
            contentType: "text/csv;charset=UTF-8",
            filename: `veiculos-${date}.csv`,
        };
    }

    const identity = await getAdminPdfIdentity();
    return buildAdminTablePdfFile(table, {
        title: "Relatório administrativo de veículos",
        recordLabel: "veículo(s)",
        filename: `veiculos-${date}`,
        exportedBy: identity.exportedBy,
        filters: filterLabels(filters),
        seal: identity.seal,
        primaryColumns: ["ID", "Apelido", "Proprietário", "Placa", "Modelo", "Guincho/reboque"],
    });
}
