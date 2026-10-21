"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Car, Eye, Pencil, Plus, ShieldX, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/common/button";
import { ListPagination } from "@/components/common/table/ListPagination";
import { useModal } from "@/providers/ModalProvider";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { maskPlate } from "@/utils/masks/maskPlate";
import { listVehiclesAdminAction } from "@/actions/admin/vehicles/list";
import { VehicleDetailModal } from "./VehicleDetailModal";
import { EditVehicleModal } from "./EditVehicleModal";
import { CreateVehicleModal } from "./CreateVehicleModal";
import { DeleteVehicleModal } from "./DeleteVehicleModal";
import { VehiclePhotoCarousel } from "@/components/pages/profile/tabs/vehicles/VehiclePhotoCarousel";

const PAGE_SIZE = 10;

export default function VehicleManagement() {
    const { setContent, setOpen } = useModal();
    const permissions = useUserStore((state) => state.permissions);

    const canRead = hasPermission(permissions, "VEHICLES", "VEHICLE_READ");
    const canCreate = hasPermission(permissions, "VEHICLES", "VEHICLE_CREATE");
    const canUpdate = hasPermission(permissions, "VEHICLES", "VEHICLE_UPDATE");
    const canDelete = hasPermission(permissions, "VEHICLES", "VEHICLE_DELETE");

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);

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
                <PageHeader title="Administração de veículos" breadcrumbs={[
                    { label: "Home", href: "/feed" },
                    { label: "Gestão Administrativa", href: "/admin" },
                    { label: "Administração de veículos" },
                ]} />
                {!canRead ? (
                    <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-j-gray-300 bg-j-white p-6 text-center">
                        <ShieldX size={42} className="mb-3 text-j-gray-400" />
                        <h3 className="text-lg font-black text-j-blue-800">Acesso não permitido</h3>
                        <p className="mt-1 text-sm text-j-gray-600">Seu usuário não possui permissão para visualizar a administração de veículos.</p>
                    </section>
                ) : (
                    <section className="flex flex-col gap-4 rounded-2xl border border-j-gray-200 bg-j-white p-4 shadow-sm sm:p-5">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="text-base font-bold text-j-gray-700">Veículos cadastrados</h3>
                            {canCreate && <Button onClick={handleOpenCreate} className="h-11 shrink-0 gap-2"><Plus size={16} /><span className="hidden sm:inline">Cadastrar veículo</span><span className="sm:hidden">Cadastrar</span></Button>}
                        </div>
                        {isLoading && <p className="text-sm text-j-gray-400">Carregando veículos...</p>}
                        {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><p>{error.message}</p><Button onClick={() => query.refetch()} disabled={isFetching}>Tentar novamente</Button></div>}
                        {!isLoading && !error && !data?.content.length && <p className="text-sm text-j-gray-400">Nenhum veículo cadastrado.</p>}
                        {!isLoading && !error && Boolean(data?.content.length) && (
                            <div className="overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
                                <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(120px,0.6fr)_minmax(140px,1fr)_280px] items-center gap-3 border-b border-j-gray-200 bg-j-gray-100/70 px-4 py-3 text-[10px] font-extrabold uppercase tracking-wide text-j-gray-400 xl:grid">
                                    <span>Veículo</span><span className="text-center">Placa</span><span className="text-center">Dono</span><span className="text-center">Ações</span>
                                </div>
                                <div className="divide-y divide-j-gray-100">
                                    {data?.content.map((vehicle) => (
                                        <div key={vehicle.id} className="flex flex-col gap-3 p-4 transition-colors hover:bg-blue-50/30 xl:grid xl:grid-cols-[minmax(0,1.2fr)_minmax(120px,0.6fr)_minmax(140px,1fr)_280px] xl:items-center xl:gap-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-j-gray-200 bg-j-blue-800 text-j-yellow-300 sm:h-20 sm:w-36">
                                                    {vehicle.photo || vehicle.photos?.length ? (
                                                        <VehiclePhotoCarousel cover={vehicle.photo} photos={vehicle.photos} alt={`Foto de ${vehicle.nickname || vehicle.model}`} className="h-full w-full" />
                                                    ) : <Car size={24} aria-hidden="true" />}
                                                </div>
                                                <h4 className="min-w-0 truncate font-extrabold text-j-blue-800" title={vehicle.nickname?.trim() ? `${vehicle.nickname.trim()} - ${vehicle.model}` : vehicle.model}>
                                                    {vehicle.nickname?.trim() ? <><span className="text-lg">{vehicle.nickname.trim()}</span><span className="text-sm font-medium"> - {vehicle.model}</span></> : <span className="text-lg">{vehicle.model}</span>}
                                                </h4>
                                            </div>
                                            <p className="text-sm font-bold text-j-gray-600 xl:text-center"><span className="mr-1 text-xs xl:hidden">Placa:</span>{maskPlate(vehicle.plate)}</p>
                                            <p className="truncate text-sm text-j-gray-600 xl:text-center" title={vehicle.ownerName ?? undefined}><span className="mr-1 text-xs font-bold xl:hidden">Dono:</span>{vehicle.ownerName || '—'}</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                <button type="button" onClick={() => handleOpenDetail(vehicle.id)} aria-label={`Visualizar ${vehicle.model}`} className="flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-2 py-2 text-xs font-bold text-j-blue-700 hover:bg-blue-100"><Eye size={15} aria-hidden="true" /><span className="hidden sm:inline">Visualizar</span></button>
                                                {canUpdate && <button type="button" onClick={() => handleOpenEdit(vehicle.id)} aria-label={`Editar ${vehicle.model}`} className="flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-yellow-50 px-2 py-2 text-xs font-bold text-j-gray-700 hover:bg-yellow-100"><Pencil size={15} className="text-j-yellow-500" aria-hidden="true" /><span className="hidden sm:inline">Editar</span></button>}
                                                {canDelete && <button type="button" onClick={() => handleOpenDelete(vehicle)} aria-label={`Excluir ${vehicle.model}`} className="flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-red-50 px-2 py-2 text-xs font-bold text-red-500 hover:bg-red-100"><Trash2 size={15} aria-hidden="true" /><span className="hidden sm:inline">Excluir</span></button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
