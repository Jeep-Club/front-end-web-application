'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Car, ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Button, ButtonIcon } from "@/components/common/button";
import { ReadOnlyField as CommonReadOnlyField } from "@/components/common/ReadOnlyField";
import { useModal } from "@/providers/ModalProvider";
import { getVehicleDetailAction } from "@/actions/vehicles/detail-member";
import { maskDate } from "@/utils/masks";
import { maskPlate } from "@/utils/masks/maskPlate";

const FUEL_TYPE_LABELS: Record<FuelType, string> = {
    GASOLINE: "Gasolina",
    ETHANOL: "Etanol",
    FLEX: "Flex",
    DIESEL: "Diesel",
    ELECTRIC: "Elétrico",
    HYBRID: "Híbrido",
};

const STATUS_LABELS: Record<VehicleStatus, string> = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
    PENDING: "Pendente",
};

const STEPS = [
    { step: 1, label: "Identificação" },
    { step: 2, label: "Características" },
    { step: 3, label: "Foto" },
];

function ReadOnlyField({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <CommonReadOnlyField
            label={label}
            value={value}
            labelClassName="text-j-gray-700"
            valueClassName="border-j-gray-200 bg-j-gray-100 text-j-gray-700"
        />
    );
}
interface ViewVehicleStepsProps {
    currentStep: number;
    onNext: () => void;
    onBack: () => void;
    onClose: () => void;
    vehicle: VehicleDetail;
}

function ViewVehicleSteps({ currentStep, onNext, onBack, onClose, vehicle }: ViewVehicleStepsProps) {
    return (
        <div className="w-full flex flex-col items-center gap-5">
            <div className="grid w-full grid-cols-3 gap-2 rounded-2xl bg-j-gray-100 p-1.5">
                {STEPS.map(({ step, label }) => {
                    const isActive = step === currentStep;
                    const isCompleted = step < currentStep;
                    return (
                        <div
                            key={step}
                            title={`Etapa ${step}`}
                            className={twMerge(
                                "flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-xs font-bold transition-colors md:text-sm",
                                isActive
                                    ? "bg-j-blue-700 text-j-white shadow-sm"
                                    : isCompleted
                                        ? "bg-j-blue-100/30 text-j-blue-700"
                                        : "text-j-gray-400"
                            )}
                        >
                            <span className={twMerge(
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px]",
                                isActive ? "bg-j-yellow-300 text-j-blue-800" : "bg-j-white",
                            )}>
                                {step}
                            </span>
                            <span className="hidden truncate sm:inline">{label}</span>
                        </div>
                    );
                })}
            </div>

            <div className="w-full min-h-[420px]">
                <div className={currentStep === 1 ? "w-full flex flex-col gap-4" : "hidden"}>
                    <ReadOnlyField label="Placa" value={maskPlate(vehicle.plate)} />
                    <ReadOnlyField label="Renavam" value={vehicle.renavam} />
                    <ReadOnlyField label="Marca" value={vehicle.brand} />
                    <ReadOnlyField label="Apelido" value={vehicle.nickname} />
                </div>

                <div className={currentStep === 2 ? "w-full flex flex-col gap-4" : "hidden"}>
                    <div className="w-full grid grid-cols-2 gap-4">
                        <ReadOnlyField label="Modelo" value={vehicle.model} />
                        <ReadOnlyField label="Cor" value={vehicle.color} />
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4">
                        <ReadOnlyField label="Ano de fabricação" value={vehicle.manufacturingYear} />
                        <ReadOnlyField label="Ano/modelo" value={vehicle.modelYear} />
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4">
                        <ReadOnlyField label="Assentos" value={vehicle.seatingCapacity} />
                        <ReadOnlyField label="Cilindrada" value={vehicle.engineDisplacement.toFixed(1)} />
                    </div>

                    <ReadOnlyField label="Combustível" value={FUEL_TYPE_LABELS[vehicle.fuelType]} />
                    <ReadOnlyField label="Guincho/reboque" value={vehicle.towing ? "Sim" : "Não"} />
                </div>

                <div className={currentStep === 3 ? "w-full flex flex-col gap-4" : "hidden"}>
                    {vehicle.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={vehicle.photo}
                            alt={vehicle.nickname || vehicle.model}
                            className="w-full h-40 object-cover rounded-lg"
                        />
                    ) : (
                        <div className="w-full h-40 flex items-center justify-center rounded-lg bg-j-gray-100">
                            <Car size={40} className="text-j-gray-300" />
                        </div>
                    )}

                    <ReadOnlyField label="Status" value={STATUS_LABELS[vehicle.status]} />

                    <div className="w-full grid grid-cols-2 gap-4">
                        <ReadOnlyField label="Cadastrado em" value={maskDate(vehicle.createdAt)} />
                        <ReadOnlyField label="Atualizado em" value={maskDate(vehicle.updatedAt)} />
                    </div>
                </div>
            </div>

            <div className="flex w-full gap-3 border-t border-j-gray-200 pt-5">
                {currentStep > 1 && (
                    <Button
                        type="button"
                        onClick={onBack}
                        className="flex-1 border-2 border-j-gray-200 bg-j-white text-j-gray-600 hover:border-j-gray-300 hover:bg-j-gray-100 hover:text-j-gray-700"
                    >
                        <ArrowLeft size={16} />
                        Voltar
                    </Button>
                )}

                {currentStep < STEPS.length ? (
                    <Button
                        type="button"
                        onClick={onNext}
                        className="flex-1 bg-j-blue-700 text-j-white hover:bg-j-blue-800 hover:text-j-white"
                    >
                        Próximo
                        <ArrowRight size={16} />
                    </Button>
                ) : (
                    <Button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-j-blue-700 text-j-white hover:bg-j-blue-800 hover:text-j-white"
                    >
                        Fechar
                    </Button>
                )}
            </div>
        </div>
    );
}

interface ViewVehicleModalProps {
    vehicleId: number;
}

export function ViewVehicleModal({ vehicleId }: ViewVehicleModalProps) {
    const { setClose } = useModal();
    const [currentStep, setCurrentStep] = useState(1);

    const { data: vehicle, isLoading } = useQuery({
        queryKey: ["vehicles", "detail", vehicleId],
        queryFn: () => getVehicleDetailAction(vehicleId),
    });

    return (
        <div
            className={`
                relative flex max-h-[92dvh] w-full max-w-3xl
                flex-col overflow-y-auto overflow-x-hidden
                rounded-3xl bg-j-white shadow-2xl
            `}
        >
            <ButtonIcon
                onClick={setClose}
                className="absolute right-4 top-4 z-10 rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800 md:right-6 md:top-6"
            >
                <X className="w-5 h-5 md:w-[22px] md:h-[22px]" />
            </ButtonIcon>

            <header className="border-b border-j-gray-200 px-5 pb-5 pr-16 pt-6 md:px-8 md:pb-6 md:pr-20 md:pt-8">
                <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300 shadow-sm">
                        <Car size={20} />
                    </span>
                    <div>
                        <h2 className="text-xl font-extrabold text-j-blue-800 md:text-2xl">
                            Detalhes do veículo
                        </h2>
                        <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                            Informações completas do seu jipe. Campos somente leitura.
                        </p>
                    </div>
                </div>
            </header>

            {isLoading || !vehicle ? (
                <div className="flex items-center justify-center gap-2 px-5 py-16 text-j-gray-500 md:px-8">
                    <LoaderCircle size={20} className="animate-spin" />
                    Carregando dados do veículo...
                </div>
            ) : (
                <div className="px-5 py-5 md:px-8 md:py-6">
                    <ViewVehicleSteps
                        currentStep={currentStep}
                        onNext={() => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))}
                        onBack={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
                        onClose={setClose}
                        vehicle={vehicle}
                    />
                </div>
            )}
        </div>
    );
}

export default ViewVehicleModal;
