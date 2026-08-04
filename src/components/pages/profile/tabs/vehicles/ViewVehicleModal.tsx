'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Car, ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Button, ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { getVehicleDetailAction } from "@/actions/vehicles/detail-member";
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

const STEPS = [1, 2, 3];

function formatDate(value: string | null): string {
    if (!value) return "—";
    return new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function ReadOnlyField({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="w-full flex flex-col gap-1.5">
            <span className="text-xs md:text-sm font-bold text-j-white">{label}</span>
            <div className="w-full border-2 border-transparent py-2 px-2.5 rounded-lg font-light text-sm md:text-base bg-input-bg text-input-text">
                {value || "—"}
            </div>
        </div>
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
        <div className="w-full flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-2">
                {STEPS.map((step) => (
                    <div
                        key={step}
                        title={`Etapa ${step}`}
                        className={twMerge(
                            "w-2.5 h-2.5 rounded-full transition-colors",
                            step === currentStep ? "bg-j-yellow-300" : "bg-j-blue-700"
                        )}
                    />
                ))}
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
                        <div className="w-full h-40 flex items-center justify-center rounded-lg bg-j-blue-900">
                            <Car size={40} className="text-j-transparent-white" />
                        </div>
                    )}

                    <ReadOnlyField label="Status" value={STATUS_LABELS[vehicle.status]} />

                    <div className="w-full grid grid-cols-2 gap-4">
                        <ReadOnlyField label="Cadastrado em" value={formatDate(vehicle.createdAt)} />
                        <ReadOnlyField label="Atualizado em" value={formatDate(vehicle.updatedAt)} />
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                {currentStep > 1 && (
                    <Button
                        type="button"
                        onClick={onBack}
                        className="flex-1 bg-transparent border-2 border-j-transparent-white text-j-white hover:bg-j-transparent-white/10 hover:text-j-white"
                    >
                        <ArrowLeft size={16} />
                        Voltar
                    </Button>
                )}

                {currentStep < STEPS.length ? (
                    <Button type="button" onClick={onNext} className="flex-1">
                        Próximo
                        <ArrowRight size={16} />
                    </Button>
                ) : (
                    <Button type="button" onClick={onClose} className="flex-1">
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
                relative w-full max-w-125
                flex flex-col gap-4 md:gap-6
                p-4 md:p-8 max-h-[90dvh] overflow-y-auto overflow-x-hidden
                bg-j-blue-800 rounded-2xl
                shadow-[-1px_16px_23px_1px_rgba(0,0,0,0.35)]
                text-j-white
            `}
        >
            <ButtonIcon
                onClick={setClose}
                className="absolute top-3 right-3 md:top-4 md:right-4 text-j-transparent-white hover:text-j-yellow-300"
            >
                <X className="w-5 h-5 md:w-[22px] md:h-[22px]" />
            </ButtonIcon>

            <div className="flex flex-col gap-2 pr-6 md:pr-8">
                <span className="flex w-10 h-10 items-center justify-center rounded-full bg-j-blue-700 text-j-yellow-300">
                    <Car size={20} />
                </span>
                <h2 className="text-lg md:text-2xl font-extrabold text-j-white">Detalhes do veículo</h2>
                <p className="text-xs md:text-sm text-j-transparent-white">
                    Informações completas do seu jipe. Campos somente leitura.
                </p>
            </div>

            {isLoading || !vehicle ? (
                <div className="flex items-center justify-center gap-2 py-10 text-j-transparent-white">
                    <LoaderCircle size={20} className="animate-spin" />
                    Carregando dados do veículo...
                </div>
            ) : (
                <ViewVehicleSteps
                    currentStep={currentStep}
                    onNext={() => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))}
                    onBack={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
                    onClose={setClose}
                    vehicle={vehicle}
                />
            )}
        </div>
    );
}

export default ViewVehicleModal;
