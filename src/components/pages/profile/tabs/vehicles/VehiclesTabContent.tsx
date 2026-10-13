'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Car, Plus, ChevronLeft, ChevronRight, IdCard, Eye, Pencil, Trash2, CalendarDays, Palette } from "lucide-react";
import { Button, ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { listVehiclesMemberAction } from "@/actions/vehicles/list-member";
import { maskPlate } from "@/utils/masks/maskPlate";
import { IncludeVehicleModal } from "./IncludeVehicleModal";
import { DeleteVehicleModal } from "./DeleteVehicleModal";
import { ViewVehicleModal } from "./ViewVehicleModal";
import { getMediaImageUrl } from "@/utils/media/imageUrl";

const PAGE_SIZE = 10;

export function VehiclesTabContent() {
    const { setContent, setOpen } = useModal();
    const [page, setPage] = useState(0);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["vehicles", "list-member", page],
        queryFn: () => listVehiclesMemberAction({ page, size: PAGE_SIZE }),
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
                <Button onClick={handleOpenIncludeVehicle}>
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
                                <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-j-gray-100 via-j-gray-50 to-j-blue-50 sm:h-56">
                                    {vehicle.photo ? (
                                        <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={getMediaImageUrl(vehicle.photo)}
                                                alt=""
                                                aria-hidden="true"
                                                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-2xl"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-j-blue-900/10" />
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={getMediaImageUrl(vehicle.photo)}
                                                alt={`Foto de ${vehicle.nickname || vehicle.model}`}
                                                className="relative h-full w-full object-contain p-2 drop-shadow-lg transition-transform duration-300 group-hover:scale-[1.03]"
                                            />
                                        </>
                                    ) : (
                                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-j-gray-400">
                                            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 text-j-blue-800 shadow-sm"><Car size={32} /></span>
                                            <span className="text-xs font-semibold">Sem foto cadastrada</span>
                                        </div>
                                    )}
                                    {vehicle.nickname && (
                                        <span className="absolute right-3 top-3 rounded-full border border-white/30 bg-j-blue-900/75 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm backdrop-blur-sm">
                                            #{vehicle.nickname}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300 shadow-sm">
                                            <Car size={21} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h4 className="truncate text-lg font-black leading-tight text-j-blue-800">
                                                {vehicle.model}
                                            </h4>
                                            <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-j-gray-100 px-2.5 py-1 text-xs font-semibold tracking-wide text-j-gray-600">
                                                <IdCard size={14} aria-hidden="true" /> {maskPlate(vehicle.plate)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex min-w-0 items-center gap-2 rounded-xl bg-j-gray-50 px-3 py-2.5 text-j-gray-600">
                                            <CalendarDays size={16} className="shrink-0 text-j-blue-700" aria-hidden="true" />
                                            <span className="truncate">{vehicle.modelYear}</span>
                                        </div>
                                        <div className="flex min-w-0 items-center gap-2 rounded-xl bg-j-gray-50 px-3 py-2.5 text-j-gray-600">
                                            <Palette size={16} className="shrink-0 text-j-blue-700" aria-hidden="true" />
                                            <span className="truncate">{vehicle.color}</span>
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

                    {data.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 pt-2">
                            <ButtonIcon
                                disabled={data.first}
                                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                                className="text-j-gray-600 disabled:flex disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={18} />
                            </ButtonIcon>
                            <span className="text-xs text-j-gray-400">
                                Página {data.number + 1} de {data.totalPages}
                            </span>
                            <ButtonIcon
                                disabled={data.last}
                                onClick={() => setPage((prev) => prev + 1)}
                                className="text-j-gray-600 disabled:flex disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={18} />
                            </ButtonIcon>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default VehiclesTabContent;
