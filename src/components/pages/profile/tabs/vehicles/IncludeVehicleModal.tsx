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
    { step: 1, label: "Identificação", fields: ["plate", "renavam", "brand", "nickname"] as const },
    { step: 2, label: "Características", fields: ["model", "color", "manufacturingYear", "modelYear", "seatingCapacity", "fuelType", "engineDisplacement", "towing"] as const },
    { step: 3, label: "Foto", fields: ["photo"] as const },
];

const LIGHT_FIELDS_CLASS = `
    [&_label]:!text-j-gray-700
    [&_input]:!border-j-gray-200 [&_input]:!bg-j-gray-100 [&_input]:!px-4 [&_input]:!py-3
    [&_input]:!text-j-gray-700 [&_input]:placeholder:!text-j-gray-400 [&_input:focus]:!bg-j-white
    [&_select]:!border-j-gray-200 [&_select]:!bg-j-gray-100 [&_select]:!px-4 [&_select]:!py-3
    [&_select]:!text-j-gray-700 [&_select:focus]:!bg-j-white
`;

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
        <div onKeyDown={handleKeyDown} className="flex w-full flex-col items-center gap-5">
            <div className="grid w-full grid-cols-3 gap-2 rounded-2xl bg-j-gray-100 p-1.5">
                {STEPS.map(({ step, label, fields }) => {
                    const hasError = fields.some((field) => !!errors[field]);
                    const isActive = step === currentStep;
                    const isCompleted = step < currentStep;
                    return (
                        <div
                            key={step}
                            title={`Etapa ${step}`}
                            className={twMerge(
                                "flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-xs font-bold transition-colors md:text-sm",
                                hasError
                                    ? "bg-j-red-100 text-j-red-600"
                                    : isActive
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

            <div className="min-h-[360px] w-full">
                <div className={currentStep === 1 ? twMerge("grid w-full gap-4 sm:grid-cols-2", LIGHT_FIELDS_CLASS) : "hidden"}>
                    <InputRegister label="Placa" name="plate" placeholder="ESC-1B23" mask={maskPlate} value={vehicle?.plate} required />
                    <InputRegister label="Renavam" name="renavam" placeholder="00000000000" mask={maskRenavam} value={vehicle?.renavam} required />
                    <InputRegister label="Marca" name="brand" placeholder="Ex: Jeep" value={vehicle?.brand} required />
                    <InputRegister label="Apelido" name="nickname" placeholder="Ex: Marruá" value={vehicle?.nickname ?? undefined} />
                </div>

            <div className={currentStep === 2 ? twMerge("flex w-full flex-col gap-4", LIGHT_FIELDS_CLASS) : "hidden"}>
                <div className="grid w-full gap-4 sm:grid-cols-2">
                    <InputRegister label="Modelo" name="model" placeholder="Ex: Wrangler" value={vehicle?.model} required />
                    <InputRegister label="Cor" name="color" placeholder="Ex: Preto" value={vehicle?.color} required />
                </div>

                <div className="grid w-full gap-4 sm:grid-cols-2">
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

                <div className="grid w-full gap-4 sm:grid-cols-2">
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

                <InputCheckbox
                    label="Possui guincho/reboque"
                    name="towing"
                    value={vehicle?.towing ?? undefined}
                    className="rounded-xl border border-j-gray-200 bg-j-gray-100/60 p-3 [&>span:last-child]:!text-j-gray-700 [&>span:first-of-type]:!border-j-gray-300 [&>span:first-of-type]:!bg-j-white"
                />
                </div>

            <div className={currentStep === 3 ? "flex w-full flex-col gap-4 rounded-2xl border border-j-gray-200 bg-j-gray-100/60 p-4 md:p-6" : "hidden"}>
                <InputFile.Image
                    name="photo"
                    label="Foto do veículo"
                    maxFiles={1}
                    className="[&_label]:font-bold [&_label]:text-j-gray-700 [&_p]:!text-j-gray-500 [&_svg]:text-j-blue-400 [&>div]:min-h-48 [&>div]:bg-j-white"
                />
                {isEditMode && vehicle?.photo && (
                    <p className="text-xs text-j-gray-500">
                        Já existe uma foto cadastrada. Envie uma nova apenas se quiser substituí-la.
                    </p>
                )}
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
                    <Button type="button" onClick={handleNext} className="flex-1 bg-j-blue-700 text-j-white hover:bg-j-blue-800 hover:text-j-white">
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
            className="flex-1 bg-j-blue-700 text-j-white hover:bg-j-blue-800 hover:text-j-white"
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
                            {isEditMode ? "Editar veículo" : "Incluir veículo"}
                        </h2>
                        <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                            {isEditMode
                                ? "Atualize os dados do seu jipe."
                                : "Cadastre o seu jipe pra ele ficar vinculado ao seu perfil no clube."}
                        </p>
                    </div>
                </div>
            </header>

            {isEditMode && isLoadingVehicle ? (
                <div className="flex items-center justify-center gap-2 px-5 py-16 text-j-gray-500 md:px-8">
                    <LoaderCircle size={20} className="animate-spin" />
                    Carregando dados do veículo...
                </div>
            ) : (
                <Form<IncludeVehicleMemberFormData | EditVehicleMemberFormData>
                    schema={isEditMode ? editVehicleMemberFormSchema : includeVehicleMemberFormSchema}
                    onSubmit={handleSubmit}
                    onError={(errors) => console.log(errors)}
                    className="gap-5 px-5 py-5 md:px-8 md:py-6"
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
