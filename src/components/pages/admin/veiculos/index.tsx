"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Car,Eye,Filter,Pencil,Plus,ShieldX,Trash2 } from "lucide-react";

import { Button } from "@/components/common/button";
import { AdminExport } from "@/components/common/admin-export/AdminExport";
import { PageHeader } from "@/components/common/page-header";
import { getVehiclesTourSteps } from "@/config/tourSteps";
import { usePageTour } from "@/hooks/useTour";
import { ListPagination } from "@/components/common/table/ListPagination";
import { ManagementBackButton } from "@/components/pages/admin/ManagementBackButton";
import { VehiclePhotoCarousel } from "@/components/pages/profile/tabs/vehicles/VehiclePhotoCarousel";
import { useModal } from "@/providers/ModalProvider";
import { listVehiclesAdminAction } from "@/server/actions/admin/vehicles/list";
import { exportAdminVehiclesAction } from "@/server/actions/admin/vehicles/export";
import { useUserStore } from "@/stores/userStore";
import { maskPlate } from "@/utils/masks/maskPlate";
import { hasPermission } from "@/utils/permission/hasPermission";
import { CreateVehicleModal } from "./CreateVehicleModal";
import { DeleteVehicleModal } from "./DeleteVehicleModal";
import { EditVehicleModal } from "./EditVehicleModal";
import { VehicleDetailModal } from "./VehicleDetailModal";

const PAGE_SIZE = 10;
type VehicleExportFilters = { vehicleId: string; ownerId: string; model: string; plate: string; towing: "ALL" | "YES" | "NO"; status: VehicleStatus | "ALL" };
const EMPTY_EXPORT_FILTERS: VehicleExportFilters = { vehicleId: "", ownerId: "", model: "", plate: "", towing: "ALL", status: "ALL" };

export default function VehicleManagement() {
    const { setContent, setOpen } = useModal();
    const permissions = useUserStore((state) => state.permissions);

    const canRead = hasPermission(permissions, "VEHICLES", "VEHICLE_READ");
    const canCreate = hasPermission(permissions, "VEHICLES", "VEHICLE_CREATE");
    const canUpdate = hasPermission(permissions, "VEHICLES", "VEHICLE_UPDATE");
    const canDelete = hasPermission(permissions, "VEHICLES", "VEHICLE_DELETE");
    usePageTour({
        storageKey: "tour_completed_admin_vehicles",
        steps: getVehiclesTourSteps,
        autoStartOnFirstVisit: false,
        enabled: canRead,
    });

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);
    const [exportFilters, setExportFilters] = useState<VehicleExportFilters>(EMPTY_EXPORT_FILTERS);
    const [showExportFilters, setShowExportFilters] = useState(false);

    const query = useQuery({
        queryKey: ["admin", "vehicles", { page, size: pageSize }],
        queryFn: () => listVehiclesAdminAction({ page, size: pageSize }),
        placeholderData: (previous) => previous,
        enabled: canRead,
    });

    const { data, isLoading, isFetching, error } = query;

    const handleOpenCreate = () => {
        setContent(<CreateVehicleModal />);
        setOpen();
    };

    const handleOpenDetail = (id: number) => {
        setContent(<VehicleDetailModal vehicleId={id} />);
        setOpen();
    };

    const handleOpenEdit = (id: number) => {
        setContent(<EditVehicleModal vehicleId={id} />);
        setOpen();
    };

    const handleOpenDelete = (vehicle: VehicleListItem) => {
        const label = vehicle.nickname
            ? `${vehicle.model} (${vehicle.nickname}) - ${maskPlate(vehicle.plate)}`
            : `${vehicle.model} - ${maskPlate(vehicle.plate)}`;

        setContent(
            <DeleteVehicleModal
                vehicleId={vehicle.id}
                vehicleLabel={label}
            />,
        );
        setOpen();
    };

    return (
        <div className="min-h-full w-full p-3 md:p-4">
            <div className="flex w-full flex-col gap-4 pb-6">
                <PageHeader id="tour-vehicles-header" title="Gestão de veículos" breadcrumbs={[
                    { label: "Home", href: "/feed" },
                    { label: "Gestão Administrativa", href: "/admin" },
                    { label: "Veículos" },
                ]} />
                {!canRead ? (
                    <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-j-gray-300 bg-j-white p-6 text-center">
                        <ShieldX size={42} className="mb-3 text-j-gray-400" />
                        <h3 className="text-lg font-black text-j-blue-800">Acesso não permitido</h3>
                        <p className="mt-1 text-sm text-j-gray-600">Seu usuário não possui permissão para visualizar a administração de veículos.</p>
                    </section>
                ) : (
                    <section className="flex flex-col gap-4 rounded-2xl border border-j-gray-200 bg-j-white p-4 shadow-sm sm:p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <ManagementBackButton />
                                <h3 className="text-base font-bold text-j-gray-700">Veículos cadastrados</h3>
                            </div>
                            <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap">
                                <AdminExport label="Exportar veículos" formats={["CSV", "PDF"]} className="w-full sm:w-auto" onExport={(format) => exportAdminVehiclesAction(format, exportFilters)} />
                                <Button type="button" aria-expanded={showExportFilters} aria-controls="vehicle-export-filters" onClick={() => setShowExportFilters((shown) => !shown)} className="h-10 w-full gap-2 border border-j-gray-300 bg-j-white px-3 text-xs text-j-blue-800 hover:bg-j-gray-100 hover:text-j-gray-700 focus-visible:bg-j-gray-100 focus-visible:text-j-gray-700 sm:w-auto sm:text-sm"><Filter size={15} aria-hidden="true" />Filtros da exportação</Button>
                                {canCreate && <Button id="tour-vehicles-create-btn" onClick={handleOpenCreate} className="h-10 w-full gap-2 sm:w-auto"><Plus size={16} /><span className="hidden sm:inline">Cadastrar veículo</span><span className="sm:hidden">Cadastrar</span></Button>}
                            </div>
                        </div>
                        {showExportFilters && <fieldset id="vehicle-export-filters" className="grid grid-cols-1 gap-3 rounded-xl border border-j-gray-200 bg-j-gray-100/50 p-3 sm:grid-cols-2 lg:grid-cols-3">
                            <legend className="px-1 text-sm font-bold text-j-blue-800">Filtrar o arquivo exportado</legend>
                            <label className="min-w-0 text-xs font-semibold text-j-gray-600">ID do veículo<input type="number" min="1" value={exportFilters.vehicleId} onChange={(event) => setExportFilters((filters) => ({ ...filters, vehicleId: event.target.value }))} className="mt-1 min-h-10 w-full rounded-lg border border-j-gray-300 bg-j-white px-3 text-sm font-normal text-j-gray-800 focus-visible:outline-2 focus-visible:outline-j-blue-800" /></label>
                            <label className="min-w-0 text-xs font-semibold text-j-gray-600">ID do usuário proprietário<input type="number" min="1" value={exportFilters.ownerId} onChange={(event) => setExportFilters((filters) => ({ ...filters, ownerId: event.target.value }))} className="mt-1 min-h-10 w-full rounded-lg border border-j-gray-300 bg-j-white px-3 text-sm font-normal text-j-gray-800 focus-visible:outline-2 focus-visible:outline-j-blue-800" /></label>
                            <label className="min-w-0 text-xs font-semibold text-j-gray-600">Marca, modelo ou apelido<input value={exportFilters.model} onChange={(event) => setExportFilters((filters) => ({ ...filters, model: event.target.value }))} className="mt-1 min-h-10 w-full rounded-lg border border-j-gray-300 bg-j-white px-3 text-sm font-normal text-j-gray-800 focus-visible:outline-2 focus-visible:outline-j-blue-800" /></label>
                            <label className="min-w-0 text-xs font-semibold text-j-gray-600">Placa<input value={exportFilters.plate} onChange={(event) => setExportFilters((filters) => ({ ...filters, plate: event.target.value }))} className="mt-1 min-h-10 w-full rounded-lg border border-j-gray-300 bg-j-white px-3 text-sm font-normal text-j-gray-800 focus-visible:outline-2 focus-visible:outline-j-blue-800" /></label>
                            <label className="min-w-0 text-xs font-semibold text-j-gray-600">Guincho/reboque<select value={exportFilters.towing} onChange={(event) => setExportFilters((filters) => ({ ...filters, towing: event.target.value as VehicleExportFilters["towing"] }))} className="mt-1 min-h-10 w-full rounded-lg border border-j-gray-300 bg-j-white px-3 text-sm font-normal text-j-gray-800 focus-visible:outline-2 focus-visible:outline-j-blue-800"><option value="ALL">Todos</option><option value="YES">Possui</option><option value="NO">Não possui</option></select></label>
                            <label className="min-w-0 text-xs font-semibold text-j-gray-600">Situação<select value={exportFilters.status} onChange={(event) => setExportFilters((filters) => ({ ...filters, status: event.target.value as VehicleExportFilters["status"] }))} className="mt-1 min-h-10 w-full rounded-lg border border-j-gray-300 bg-j-white px-3 text-sm font-normal text-j-gray-800 focus-visible:outline-2 focus-visible:outline-j-blue-800"><option value="ALL">Todas</option><option value="ACTIVE">Ativo</option><option value="INACTIVE">Inativo</option><option value="ARCHIVED">Arquivado</option></select></label>
                            <button type="button" onClick={() => setExportFilters(EMPTY_EXPORT_FILTERS)} className="min-h-9 cursor-pointer justify-self-start rounded-lg px-3 text-xs font-bold text-j-blue-800 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-j-blue-800 sm:col-span-2 lg:col-span-3">Limpar filtros da exportação</button>
                        </fieldset>}
                        <div id="tour-vehicles-list">
                        {isLoading && <p className="text-sm text-j-gray-400">Carregando veículos...</p>}
                        {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><p>{error.message}</p><Button onClick={() => query.refetch()} disabled={isFetching}>Tentar novamente</Button></div>}
                        {!isLoading && !error && !data?.content.length && <p className="text-sm text-j-gray-400">Nenhum veículo cadastrado.</p>}
                        {!isLoading && !error && Boolean(data?.content.length) && (
                            <div className="overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
                                <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(120px,0.6fr)_minmax(140px,1fr)_280px] items-center gap-3 border-b border-j-gray-200 bg-j-gray-100/70 px-4 py-3 text-[10px] font-extrabold uppercase tracking-wide text-j-gray-400 xl:grid">
                                    <span>Veículo</span><span className="text-center">Placa</span><span className="text-center">Dono</span><span className="text-center">Ações</span>
                                </div>
                                <div className="divide-y divide-j-gray-100">
                                    {data?.content.map((vehicle, index) => (
                                        <div key={vehicle.id} className="flex flex-col gap-3 p-4 transition-colors hover:bg-blue-50/30 xl:grid xl:grid-cols-[minmax(0,1.2fr)_minmax(120px,0.6fr)_minmax(140px,1fr)_280px] xl:items-center xl:gap-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-j-gray-200 bg-j-blue-800 text-j-yellow-300 sm:h-20 sm:w-36">
                                                    {vehicle.photo || vehicle.photos?.length ? (
                                                        <VehiclePhotoCarousel vehicleId={vehicle.id} admin cover={vehicle.photo} photos={vehicle.photos} alt={`Foto de ${vehicle.nickname || vehicle.model}`} className="h-full w-full" />
                                                    ) : <Car size={24} aria-hidden="true" />}
                                                </div>
                                                <h4 className="min-w-0 break-words font-extrabold text-j-blue-800" title={vehicle.nickname?.trim() ? `${vehicle.nickname.trim()} - ${vehicle.model}` : vehicle.model}>
                                                    {vehicle.nickname?.trim() ? <><span className="text-lg [overflow-wrap:anywhere]">{vehicle.nickname.trim()}</span><span className="ml-1 inline-block text-sm font-medium [overflow-wrap:anywhere]">- {vehicle.model}</span></> : <span className="text-lg [overflow-wrap:anywhere]">{vehicle.model}</span>}
                                                </h4>
                                            </div>
                                            <p className="text-sm font-bold text-j-gray-600 xl:text-center"><span className="mr-1 text-xs xl:hidden">Placa:</span>{maskPlate(vehicle.plate)}</p>
                                            <p className="truncate text-sm text-j-gray-600 xl:text-center" title={vehicle.ownerName ?? undefined}><span className="mr-1 text-xs font-bold xl:hidden">Dono:</span>{vehicle.ownerName || '—'}</p>
                                            <div id={index === 0 ? "tour-vehicles-actions" : undefined} className="grid grid-cols-3 gap-2">
                                                <button type="button" onClick={() => handleOpenDetail(vehicle.id)} aria-label={`Visualizar ${vehicle.model}`} className="flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-2 py-2 text-xs font-bold text-j-blue-700 hover:bg-blue-100"><Eye size={15} aria-hidden="true" /><span className="hidden sm:inline">Visualizar</span></button>
                                                {canUpdate && <button type="button" onClick={() => handleOpenEdit(vehicle.id)} aria-label={`Editar ${vehicle.model}`} className="flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-yellow-50 px-2 py-2 text-xs font-bold text-j-gray-700 hover:bg-yellow-100"><Pencil size={15} className="text-j-yellow-500" aria-hidden="true" /><span className="hidden sm:inline">Editar</span></button>}
                                                {canDelete && <button type="button" onClick={() => handleOpenDelete(vehicle)} aria-label={`Excluir ${vehicle.model}`} className="flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-red-50 px-2 py-2 text-xs font-bold text-red-500 hover:bg-red-100"><Trash2 size={15} aria-hidden="true" /><span className="hidden sm:inline">Excluir</span></button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        </div>
                        {data && !error && <ListPagination itemLabel="veículo" isFetching={isFetching} pagination={{
                            pageIndex: data.number, pageSize, pageCount: data.totalPages, rowCount: data.totalElements,
                            onChange: (next) => { setPage(next.pageSize !== pageSize ? 0 : next.pageIndex); setPageSize(next.pageSize); },
                        }} />}
                    </section>
                )}
            </div>
        </div>
    );
}
