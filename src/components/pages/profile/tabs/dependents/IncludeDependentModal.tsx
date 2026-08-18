'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { X, Users } from "lucide-react";
import { Form } from "@/components/common/form";
import { Button, ButtonIcon } from "@/components/common/button";
import { InputRegister } from "@/components/common/input/input-register";
import { InputCheckbox } from "@/components/common/input/input-checkbox";
import { SelectRegister } from "@/components/common/select/select-register";
import { useModal } from "@/providers/ModalProvider";
import { createDependentFormSchema } from "@/schemas/profile/dependent";
import { createDependentMemberAction } from "@/actions/dependents/create-member";
import { maskCPF } from "@/utils/masks/maskCPF";
import { maskPhoneNumber } from "@/utils/masks/maskPhoneNumber";

const LIGHT_FIELDS_CLASS = `
    [&_label]:!text-j-gray-700
    [&_input]:!border-j-gray-200 [&_input]:!bg-j-gray-100 [&_input]:!px-4 [&_input]:!py-3
    [&_input]:!text-j-gray-700 [&_input]:placeholder:!text-j-gray-400 [&_input:focus]:!bg-j-white
    [&_select]:!border-j-gray-200 [&_select]:!bg-j-gray-100 [&_select]:!px-4 [&_select]:!py-3
    [&_select]:!text-j-gray-700 [&_select:focus]:!bg-j-white
`;

const RELATIONSHIP_TYPE_OPTIONS: { value: DependentRelationshipType; label: string }[] = [
    { value: "CHILD", label: "Filho(a)" },
    { value: "SPOUSE", label: "Cônjuge" },
    { value: "PARENT", label: "Pai/Mãe" },
    { value: "SIBLING", label: "Irmão/Irmã" },
    { value: "GUEST", label: "Convidado(a)" },
    { value: "OTHER", label: "Outro" },
];

export function IncludeDependentModal() {
    const { setClose } = useModal();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: CreateDependentFormData) => createDependentMemberAction(data),
        onSuccess: () => {
            toast.success("Dependente cadastrado com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["dependents", "list-member"] });
            setClose();
        },
        onError: (error) => toast.error(error.message || "Erro ao cadastrar dependente."),
    });

    return (
        <div
            className={`
                relative flex max-h-[92dvh] w-full max-w-125
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
                        <Users size={20} />
                    </span>
                    <div>
                        <h2 className="text-xl font-extrabold text-j-blue-800 md:text-2xl">
                            Incluir dependente
                        </h2>
                        <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                            Cadastre um dependente vinculado ao seu perfil no clube.
                        </p>
                    </div>
                </div>
            </header>

            <Form<CreateDependentFormData>
                schema={createDependentFormSchema}
                onSubmit={(data) => mutation.mutateAsync(data)}
                onError={(errors) => console.log(errors)}
                className="gap-5 px-5 py-5 md:px-8 md:py-6"
            >
                <div className={`flex w-full flex-col gap-4 ${LIGHT_FIELDS_CLASS}`}>
                    <InputRegister
                        label="Nome completo"
                        name="name"
                        placeholder="Nome completo do dependente"
                        required
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <InputRegister
                            label="CPF"
                            name="cpf"
                            placeholder="000.000.000-00"
                            mask={maskCPF}
                            required
                        />
                        <InputRegister
                            type="date"
                            label="Data de nascimento"
                            name="birthDate"
                        />
                    </div>

                    <SelectRegister label="Parentesco" name="relationshipType" required>
                        <option value="" disabled>Selecione</option>
                        {RELATIONSHIP_TYPE_OPTIONS.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </SelectRegister>

                    <InputRegister
                        label="Telefone"
                        name="phoneNumber"
                        placeholder="(00) 00000-0000"
                        mask={maskPhoneNumber}
                    />

                    <InputCheckbox
                        label="Confirmo o aceite do termo de consentimento LGPD para armazenamento dos dados deste dependente."
                        name="consentAccepted"
                        className="rounded-xl border border-j-gray-200 bg-j-gray-100/60 p-3 [&>span:last-child]:!text-j-gray-700 [&>span:first-of-type]:!border-j-gray-300 [&>span:first-of-type]:!bg-j-white"
                    />
                </div>

                <div className="flex w-full gap-3 border-t border-j-gray-200 pt-5">
                    <Button
                        type="submit"
                        disabled={mutation.isPending}
                        className="flex-1 bg-j-yellow-300 text-j-black hover:bg-j-yellow-500 hover:text-j-black"
                    >
                        {mutation.isPending ? "Cadastrando..." : "Cadastrar dependente"}
                    </Button>
                </div>
            </Form>
        </div>
    );
}

export default IncludeDependentModal;
