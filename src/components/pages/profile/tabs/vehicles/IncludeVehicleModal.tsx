'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { X, Car } from "lucide-react";
import { Form } from "@/components/common/form";
import { Button, ButtonIcon } from "@/components/common/button";
import { InputRegister } from "@/components/common/input/input-register";
import { SelectRegister } from "@/components/common/select/select-register";
import { InputCheckbox } from "@/components/common/input/input-checkbox";
import { includeVehicleMemberFormSchema } from "@/schemas/vehicles/include";
import { includeVehicleMemberAction } from "@/actions/vehicles/include-member";
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

export function IncludeVehicleModal() {
    const { setClose } = useModal();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: includeVehicleMemberAction,
        onSuccess: () => {
            toast.success("Veículo cadastrado com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["vehicles", "list-member"] });
            setClose();
        },
        onError: (error) => toast.error(error.message || "Erro ao cadastrar veículo."),
    });

    const isLoading = mutation.isPending;

    const handleSubmit = async (data: IncludeVehicleMemberFormData) => {
        mutation.mutateAsync(data);
    };

    return (
        <div
            className={`
                relative w-full
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
                <h2 className="text-lg md:text-2xl font-extrabold text-j-white">Incluir veículo</h2>
                <p className="text-xs md:text-sm text-j-transparent-white">
                    Cadastre o seu jipe pra ele ficar vinculado ao seu perfil no clube.
                </p>
            </div>

            <Form<IncludeVehicleMemberFormData>
                schema={includeVehicleMemberFormSchema}
                onSubmit={handleSubmit}
                onError={(errors) => console.log(errors)}
                className="gap-4"
            >
                <InputRegister label="Apelido" name="nickname" placeholder="Ex: Marruá" />
                <InputRegister label="Placa" name="plate" placeholder="ESC-1B23" mask={maskPlate} required />
                <InputRegister label="Renavam" name="renavam" placeholder="00000000000" mask={maskRenavam} required />
                <InputRegister label="Marca" name="brand" placeholder="Ex: Jeep" required />
                <InputRegister label="Modelo" name="model" placeholder="Ex: Wrangler" required />
                <InputRegister label="Cor" name="color" placeholder="Ex: Preto" required />

                <div className="w-full grid grid-cols-2 gap-4">
                    <InputRegister
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        label="Ano de fabricação"
                        name="manufacturingYear"
                        placeholder="2020"
                        mask={maskYear}
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
                        required
                    />
                </div>

                <div className="w-full grid grid-cols-2 gap-4">
                    <InputRegister type="number" label="Assentos" name="seatingCapacity" placeholder="5" required />
                    <InputRegister
                        type="text"
                        inputMode="decimal"
                        label="Cilindrada"
                        name="engineDisplacement"
                        placeholder="2.0"
                        mask={maskDecimal}
                        required
                    />
                </div>

                <SelectRegister label="Combustível" name="fuelType" required>
                    <option value="" disabled>Selecione</option>
                    {FUEL_TYPE_OPTIONS.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </SelectRegister>

                <InputCheckbox label="Possui guincho/reboque" name="towing" />

                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Cadastrando..." : "Cadastrar veículo"}
                </Button>
            </Form>
        </div>
    );
}

export default IncludeVehicleModal;
