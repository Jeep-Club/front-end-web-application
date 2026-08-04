'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Car, Plus, ChevronLeft, ChevronRight, IdCard, Eye, Trash2 } from "lucide-react";
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
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {data.content.map((vehicle) => (
                            <div
                                key={vehicle.id}
                                className="flex flex-col overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm"
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
                                    <h4 className="text-lg font-extrabold leading-tight text-j-gray-700">
                                        {vehicle.model}
                                    </h4>

                                    <div className="flex items-center gap-1.5 text-sm font-semibold text-j-gray-500">
                                        <IdCard size={16} />
                                        {maskPlate(vehicle.plate)}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 border-t border-j-gray-100 pt-3">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold uppercase tracking-wide text-j-gray-400">
                                                Ano/Modelo
                                            </span>
                                            <span className="text-sm font-bold text-j-gray-700">{vehicle.modelYear}</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold uppercase tracking-wide text-j-gray-400">
                                                Cor
                                            </span>
                                            <span className="text-sm font-bold text-j-gray-700">{vehicle.color}</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex items-center gap-2 pt-1">
                                        <Button
                                            onClick={() => handleOpenEditVehicle(vehicle.id)}
                                            className="flex-1 bg-yellow-400 text-yellow-950 hover:bg-yellow-500 hover:text-yellow-950"
                                        >
                                            Editar
                                        </Button>
                                        <ButtonIcon
                                            onClick={() => handleOpenViewVehicle(vehicle.id)}
                                            title="Visualizar"
                                            className="rounded-lg border-none bg-j-blue-800 p-3 text-white hover:bg-j-blue-500 hover:text-white disabled:flex"
                                        >
                                            <Eye size={20} />
                                        </ButtonIcon>
                                        <ButtonIcon
                                            onClick={() => handleOpenDeleteVehicle(vehicle)}
                                            title="Excluir"
                                            className="rounded-lg border-none bg-red-500 p-3 text-white hover:bg-red-600 hover:text-white disabled:flex"
                                        >
                                            <Trash2 size={20} />
                                        </ButtonIcon>
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
