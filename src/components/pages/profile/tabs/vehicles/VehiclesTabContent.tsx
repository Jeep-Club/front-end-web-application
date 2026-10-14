'use client';

import { useState } from "react";
import { ListPagination } from "@/components/common/table/ListPagination";
import { useQuery } from "@tanstack/react-query";
import { Plus, Eye, Pencil, Trash2, CalendarDays, Palette } from "lucide-react";
import { Button } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { listVehiclesMemberAction } from "@/actions/vehicles/list-member";
import { maskPlate } from "@/utils/masks/maskPlate";
import { IncludeVehicleModal } from "./IncludeVehicleModal";
import { DeleteVehicleModal } from "./DeleteVehicleModal";
import { ViewVehicleModal } from "./ViewVehicleModal";
import { VehiclePhotoCarousel } from "./VehiclePhotoCarousel";



export function VehiclesTabContent() {
    const { setContent, setOpen } = useModal();
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey: ["vehicles", "list-member", page, pageSize],
        queryFn: () => listVehiclesMemberAction({ page, size: pageSize }),
    });

    const handleOpenIncludeVehicle = () => {
        setContent(<IncludeVehicleModal />);
        setOpen();
    };

    const handleOpenEditVehicle = (vehicleId: number) => {
        setContent(<IncludeVehicleModal vehicleId={vehicleId} />);
        setOpen();
    };

    const handleOpenViewVehicle = (vehicleId: number) => {
        setContent(<ViewVehicleModal vehicleId={vehicleId} />);
        setOpen();
    };

    const handleOpenDeleteVehicle = (vehicle: VehicleListItem) => {
        setContent(
            <DeleteVehicleModal
                vehicleId={vehicle.id}
                vehicleLabel={vehicle.nickname || `${vehicle.model} (${maskPlate(vehicle.plate)})`}
            />
        );
        setOpen();
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-j-gray-700">Meus veículos</h3>
                <Button onClick={handleOpenIncludeVehicle} className="h-11 w-24 shrink-0 justify-center whitespace-nowrap sm:w-52">
                    <Plus size={16} />
                    <span className="hidden sm:inline">Incluir Veículo</span>
                    <span className="sm:hidden">Incluir</span>
                </Button>
            </div>

            {isLoading && (
                <p className="text-sm text-j-gray-400">Carregando veículos...</p>
            )}

            {isError && (
                <p className="text-sm text-j-red-400">Não foi possível carregar seus veículos.</p>
            )}

            {!isLoading && !isError && data?.content.length === 0 && (
                <p className="text-sm text-j-gray-400">Você ainda não tem nenhum veículo cadastrado.</p>
            )}

            {!isLoading && !isError && data && data.content.length > 0 && (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {data.content.map((vehicle) => (
                            <div
                                key={vehicle.id}
                                className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className="relative aspect-video w-full overflow-hidden bg-[#111827]">
                                    <VehiclePhotoCarousel photos={vehicle.photos?.length ? vehicle.photos : [vehicle.photo]} alt={`Foto de ${vehicle.nickname || vehicle.model}`} className="absolute inset-0 h-full w-full" />
                                </div>

                                <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
                                    <div className="flex min-w-0 items-center justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <h4 className="mt-0.5 truncate text-xl font-black leading-tight text-j-blue-800">
                                                {vehicle.model}
                                            </h4>
                                        </div>

                                        <div className="inline-flex shrink-0 flex-col overflow-hidden rounded-lg border border-j-gray-300 bg-white shadow-sm">
                                            <span className="bg-j-blue-800 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white">
                                                Placa do veículo
                                            </span>
                                            <span className="px-3 py-1 font-mono text-base font-extrabold leading-none tracking-[0.14em] text-j-gray-800 sm:text-lg" aria-label={`Placa ${maskPlate(vehicle.plate)}`}>
                                                {maskPlate(vehicle.plate)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex min-w-0 items-center gap-2 rounded-xl border border-j-gray-200 bg-j-gray-50 px-3 py-2.5 text-j-gray-600">
                                            <CalendarDays size={16} className="shrink-0 text-j-blue-700" aria-hidden="true" />
                                            <span className="shrink-0 text-xs font-bold">Ano:</span>
                                            <span className="truncate">{vehicle.modelYear}</span>
                                        </div>
                                        <div className="flex min-w-0 items-center gap-2 rounded-xl border border-j-gray-200 bg-j-gray-50 px-3 py-2.5 text-j-gray-600">
                                            <Palette size={16} className="shrink-0 text-j-blue-700" aria-hidden="true" />
                                            <span className="shrink-0 text-xs font-bold">Cor:</span>
                                            <span className="truncate" title={vehicle.color}>{vehicle.color}</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto grid grid-cols-3 gap-2 border-t border-j-gray-100 pt-3">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEditVehicle(vehicle.id)}
                                            className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl bg-yellow-50 px-2 py-2 text-xs font-bold text-j-gray-700 transition-colors hover:bg-yellow-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-yellow-500"
                                        >
                                            <Pencil size={17} className="text-yellow-600" aria-hidden="true" />
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenViewVehicle(vehicle.id)}
                                            className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl bg-blue-50 px-2 py-2 text-xs font-bold text-j-gray-700 transition-colors hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-700"
                                        >
                                            <Eye size={17} className="text-j-blue-800" aria-hidden="true" />
                                            Visualizar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenDeleteVehicle(vehicle)}
                                            className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl bg-red-50 px-2 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                        >
                                            <Trash2 size={17} aria-hidden="true" />
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <ListPagination
                        itemLabel="veículo"
                        isFetching={isFetching}
                        pagination={{
                            pageIndex: data.number,
                            pageSize,
                            pageCount: data.totalPages,
                            rowCount: data.totalElements,
                            onChange: (next) => {
                                setPage(next.pageSize !== pageSize ? 0 : next.pageIndex);
                                setPageSize(next.pageSize);
                            },
                        }}
                    />
                </>
            )}
        </div>
    );
}

export default VehiclesTabContent;
