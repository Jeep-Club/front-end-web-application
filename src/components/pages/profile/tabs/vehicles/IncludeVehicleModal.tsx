'use client';

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import toast from "react-hot-toast";
import { X, Car, ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Form } from "@/components/common/form";
import { Button, ButtonIcon } from "@/components/common/button";
import { InputRegister } from "@/components/common/input/input-register";
import { SelectRegister } from "@/components/common/select/select-register";
import { InputCheckbox } from "@/components/common/input/input-checkbox";
import { InputFile } from "@/components/common/input/file";
import { includeVehicleMemberFormSchema } from "@/schemas/vehicles/include";
import { includeVehicleMemberAction } from "@/actions/vehicles/include-member";
import { editVehicleMemberFormSchema } from "@/schemas/vehicles/edit";
import { editVehicleMemberAction } from "@/actions/vehicles/edit-member";
import { getVehicleDetailForEditAction } from "@/actions/vehicles/detail-for-edit-member";
import { useModal } from "@/providers/ModalProvider";
import { maskPlate } from "@/utils/masks/maskPlate";
import { maskRenavam } from "@/utils/masks/maskRenavam";
import { maskYear } from "@/utils/masks/maskYear";
import { maskDecimal } from "@/utils/masks/maskDecimal";

const FUEL_TYPE_OPTIONS: { value: FuelType; label: string }[] = [
    { value: "GASOLINE", label: "Gasolina" },
    { value: "ETHANOL", label: "Etanol" },
    { value: "FLEX", label: "Flex" },
    { value: "DIESEL", label: "Diesel" },
    { value: "ELECTRIC", label: "Elétrico" },
    { value: "HYBRID", label: "Híbrido" },
];

const STEPS = [
    { step: 1, fields: ["plate", "renavam", "brand", "nickname"] as const },
    { step: 2, fields: ["model", "color", "manufacturingYear", "modelYear", "seatingCapacity", "fuelType", "engineDisplacement", "towing"] as const },
    { step: 3, fields: ["photo"] as const },
];

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

interface VehicleStepsFieldsProps {
    currentStep: number;
    onNext: () => void;
    onBack: () => void;
    isEditMode: boolean;
    vehicle?: VehicleDetailForEdit;
}

function VehicleStepsFields({ currentStep, onNext, onBack, isEditMode, vehicle }: VehicleStepsFieldsProps) {
    const { trigger, formState: { errors } } = useFormContext();

    const handleNext = async () => {
        const fields = STEPS[currentStep - 1].fields;
        const isValid = await trigger(fields as unknown as string[]);
        if (isValid) onNext();
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key !== 'Enter') return;
        if (currentStep < STEPS.length) {
            event.preventDefault();
            handleNext();
        }
    };

    return (
        <div onKeyDown={handleKeyDown} className="w-full flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-2">
                {STEPS.map(({ step, fields }) => {
                    const hasError = fields.some((field) => !!errors[field]);
                    return (
                        <div
                            key={step}
                            title={`Etapa ${step}`}
                            className={twMerge(
                                "w-2.5 h-2.5 rounded-full transition-colors",
                                hasError
                                    ? "bg-j-red-400"
                                    : step === currentStep
                                        ? "bg-j-yellow-300"
                                        : "bg-j-blue-700"
                            )}
                        />
                    );
                })}
            </div>

            <div className="w-full min-h-[420px]">
            <div className={currentStep === 1 ? "w-full flex flex-col gap-4" : "hidden"}>
                <InputRegister label="Placa" name="plate" placeholder="ESC-1B23" mask={maskPlate} value={vehicle?.plate} required />
                <InputRegister label="Renavam" name="renavam" placeholder="00000000000" mask={maskRenavam} value={vehicle?.renavam} required />
                <InputRegister label="Marca" name="brand" placeholder="Ex: Jeep" value={vehicle?.brand} required />
                <InputRegister label="Apelido" name="nickname" placeholder="Ex: Marruá" value={vehicle?.nickname ?? undefined} />
            </div>

            <div className={currentStep === 2 ? "w-full flex flex-col gap-4" : "hidden"}>
                <div className="w-full grid grid-cols-2 gap-4">
                    <InputRegister label="Modelo" name="model" placeholder="Ex: Wrangler" value={vehicle?.model} required />
                    <InputRegister label="Cor" name="color" placeholder="Ex: Preto" value={vehicle?.color} required />
                </div>

                <div className="w-full grid grid-cols-2 gap-4">
                    <InputRegister
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        label="Ano de fabricação"
                        name="manufacturingYear"
                        placeholder="2020"
                        mask={maskYear}
                        value={vehicle ? String(vehicle.manufacturingYear) : undefined}
                        required
                    />
                    <InputRegister
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        label="Ano/modelo"
                        name="modelYear"
                        placeholder="2020"
                        mask={maskYear}
                        value={vehicle ? String(vehicle.modelYear) : undefined}
                        required
                    />
                </div>

                <div className="w-full grid grid-cols-2 gap-4">
                    <InputRegister
                        type="number"
                        label="Assentos"
                        name="seatingCapacity"
                        placeholder="5"
                        value={vehicle ? String(vehicle.seatingCapacity) : undefined}
                        required
                    />
                    <InputRegister
                        type="text"
                        inputMode="decimal"
                        label="Cilindrada"
                        name="engineDisplacement"
                        placeholder="2.0"
                        mask={maskDecimal}
                        value={vehicle ? vehicle.engineDisplacement.toFixed(1) : undefined}
                        required
                    />
                </div>

                <SelectRegister label="Combustível" name="fuelType" value={vehicle?.fuelType} required>
                    <option value="" disabled>Selecione</option>
                    {FUEL_TYPE_OPTIONS.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </SelectRegister>

                <InputCheckbox label="Possui guincho/reboque" name="towing" value={vehicle?.towing ?? undefined} />
            </div>

            <div className={currentStep === 3 ? "w-full flex flex-col gap-4" : "hidden"}>
                <InputFile.Image name="photo" label="Foto do veículo" maxFiles={1} />
                {isEditMode && vehicle?.photo && (
                    <p className="text-xs text-j-transparent-white">
                        Já existe uma foto cadastrada. Envie uma nova apenas se quiser substituí-la.
                    </p>
                )}
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
                    <Button type="button" onClick={handleNext} className="flex-1">
                        Próximo
                        <ArrowRight size={16} />
                    </Button>
                ) : (
                    <SubmitButton isEditMode={isEditMode} />
                )}
            </div>
        </div>
    );
}

function SubmitButton({ isEditMode }: { isEditMode: boolean }) {
    const { formState } = useFormContext();
    const label = isEditMode
        ? (formState.isSubmitting ? "Salvando..." : "Salvar")
        : (formState.isSubmitting ? "Cadastrando..." : "Cadastrar veículo");

    return (
        <Button
            type="submit"
            disabled={formState.isSubmitting}
            className="flex-1 bg-j-yellow-300 text-j-black hover:bg-j-yellow-500 hover:text-j-black"
        >
            {label}
        </Button>
    );
}

interface IncludeVehicleModalProps {
    vehicleId?: number;
}

export function IncludeVehicleModal({ vehicleId }: IncludeVehicleModalProps) {
    const { setClose } = useModal();
    const queryClient = useQueryClient();
    const [currentStep, setCurrentStep] = useState(1);
    const isEditMode = !!vehicleId;

    const { data: vehicle, isLoading: isLoadingVehicle } = useQuery({
        queryKey: ["vehicles", "detail-for-edit", vehicleId],
        queryFn: () => getVehicleDetailForEditAction(vehicleId!),
        enabled: isEditMode,
    });

    const mutation = useMutation({
        mutationFn: async (data: IncludeVehicleMemberFormData | EditVehicleMemberFormData) => {
            const photoFile = data.photo?.[0];
            const photo = photoFile ? await fileToBase64(photoFile) : (vehicle?.photo ?? undefined);

            if (isEditMode && vehicleId) {
                const payload: EditVehicleMemberRequest = {
                    nickname: data.nickname,
                    photo,
                    plate: data.plate,
                    renavam: data.renavam,
                    brand: data.brand,
                    model: data.model,
                    manufacturingYear: data.manufacturingYear,
                    modelYear: data.modelYear,
                    color: data.color,
                    seatingCapacity: data.seatingCapacity,
                    fuelType: data.fuelType,
                    engineDisplacement: data.engineDisplacement,
                    towing: data.towing,
                };
                return editVehicleMemberAction(vehicleId, payload);
            }

            const payload: IncludeVehicleMemberRequest = { ...(data as IncludeVehicleMemberFormData), photo };
            return includeVehicleMemberAction(payload);
        },
        onSuccess: () => {
            toast.success(isEditMode ? "Veículo atualizado com sucesso!" : "Veículo cadastrado com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["vehicles", "list-member"] });
            setClose();
        },
        onError: (error) => toast.error(error.message || (isEditMode ? "Erro ao editar veículo." : "Erro ao cadastrar veículo.")),
    });

    const handleSubmit = async (data: IncludeVehicleMemberFormData | EditVehicleMemberFormData) => {
        mutation.mutateAsync(data);
    };

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
                <h2 className="text-lg md:text-2xl font-extrabold text-j-white">
                    {isEditMode ? "Editar veículo" : "Incluir veículo"}
                </h2>
                <p className="text-xs md:text-sm text-j-transparent-white">
                    {isEditMode
                        ? "Atualize os dados do seu jipe."
                        : "Cadastre o seu jipe pra ele ficar vinculado ao seu perfil no clube."}
                </p>
            </div>

            {isEditMode && isLoadingVehicle ? (
                <div className="flex items-center justify-center gap-2 py-10 text-j-transparent-white">
                    <LoaderCircle size={20} className="animate-spin" />
                    Carregando dados do veículo...
                </div>
            ) : (
                <Form<IncludeVehicleMemberFormData | EditVehicleMemberFormData>
                    schema={isEditMode ? editVehicleMemberFormSchema : includeVehicleMemberFormSchema}
                    onSubmit={handleSubmit}
                    onError={(errors) => console.log(errors)}
                    className="gap-4"
                >
                    <VehicleStepsFields
                        currentStep={currentStep}
                        onNext={() => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))}
                        onBack={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
                        isEditMode={isEditMode}
                        vehicle={vehicle}
                    />
                </Form>
            )}
        </div>
    );
}

export default IncludeVehicleModal;
