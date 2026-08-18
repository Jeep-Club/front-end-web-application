'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Car, Plus, ChevronLeft, ChevronRight, IdCard, Eye, Pencil, Trash2 } from "lucide-react";
import { Button, ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { listVehiclesMemberAction } from "@/actions/vehicles/list-member";
import { maskPlate } from "@/utils/masks/maskPlate";
import { IncludeVehicleModal } from "./IncludeVehicleModal";
import { DeleteVehicleModal } from "./DeleteVehicleModal";
import { ViewVehicleModal } from "./ViewVehicleModal";

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
                    <div className="grid grid-cols-1 gap-4">
                        {data.content.map((vehicle) => (
                            <div
                                key={vehicle.id}
                                className="flex w-full flex-col overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm md:w-1/3"
                            >
                                <div className="relative h-40 w-full bg-j-gray-100">
                                    {vehicle.photo ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={vehicle.photo}
                                            alt={vehicle.nickname || vehicle.model}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <Car size={40} className="text-j-gray-300" />
                                        </div>
                                    )}
                                    {vehicle.nickname && (
                                        <span className="absolute right-3 top-3 rounded-full bg-j-black/70 px-3 py-1 text-xs font-bold uppercase tracking-wide text-j-white">
                                            #{vehicle.nickname}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col gap-3 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-j-blue-800 text-j-yellow-300">
                                            <Car size={21} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h4 className="truncate font-black text-j-blue-800">
                                                {vehicle.model}
                                            </h4>
                                            <div className="mt-1 flex items-center gap-1.5 text-sm text-j-gray-600">
                                                <IdCard size={14} />
                                                {maskPlate(vehicle.plate)}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-j-gray-600">
                                        {vehicle.modelYear} • {vehicle.color}
                                    </p>

                                    <div className="mt-1 grid grid-cols-1 gap-2 border-t border-j-gray-100 pt-3">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEditVehicle(vehicle.id)}
                                            className="flex items-center gap-2.5 rounded-lg bg-yellow-50 px-2.5 py-2 text-left text-sm font-bold text-j-gray-700 transition-colors hover:bg-yellow-100"
                                        >
                                            <Pencil size={16} className="text-yellow-500" />
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenViewVehicle(vehicle.id)}
                                            className="flex items-center gap-2.5 rounded-lg bg-blue-50 px-2.5 py-2 text-left text-sm font-bold text-j-gray-700 transition-colors hover:bg-blue-100"
                                        >
                                            <Eye size={16} className="text-j-blue-800" />
                                            Visualizar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenDeleteVehicle(vehicle)}
                                            className="flex items-center gap-2.5 rounded-lg bg-red-50 px-2.5 py-2 text-left text-sm font-bold text-red-500 transition-colors hover:bg-red-100"
                                        >
                                            <Trash2 size={16} />
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
