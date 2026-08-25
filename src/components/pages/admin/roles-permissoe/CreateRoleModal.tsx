'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { Form } from "@/components/common/form";
import { Button, ButtonIcon } from "@/components/common/button";
import { InputRegister } from "@/components/common/input/input-register";
import { TextareaRegister } from "@/components/common/textarea/textarea-register";
import { useModal } from "@/providers/ModalProvider";
import { createRoleRequestSchema } from "@/schemas/authorization/create";
import { createRoleAction } from "@/actions/authorization/create-role";

const LIGHT_FIELD_CLASS = "border-j-gray-200 bg-j-gray-100 px-4 py-3 text-j-gray-700 placeholder:text-j-gray-400 focus:bg-j-white";

export function CreateRoleModal() {
    const { setClose } = useModal();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: CreateRoleRequest) => createRoleAction(data),
        onSuccess: () => {
            toast.success("Cargo criado com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["authorization", "roles"] });
            setClose();
        },
        onError: (error) => toast.error(error.message || "Erro ao criar cargo."),
    });

    const handleSubmit = async (data: CreateRoleRequest) => {
        mutation.mutateAsync(data);
    };

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
                <h2 className="text-xl font-extrabold text-j-blue-800 md:text-2xl">
                    Criar cargo
                </h2>
                <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                    Um cargo define o que os administradores com ele podem acessar e fazer.
                </p>
            </header>

            <Form<CreateRoleRequest>
                schema={createRoleRequestSchema}
                onSubmit={handleSubmit}
                onError={(errors) => console.log(errors)}
                className="gap-4 px-5 py-5 md:px-8 md:py-6"
            >
                <InputRegister
                    label="Nome do cargo"
                    name="name"
                    placeholder="Ex.: Administrador de autorização"
                    maxLength={100}
                    required
                    labelClassName="text-j-gray-700"
                    className={LIGHT_FIELD_CLASS}
                />

                <TextareaRegister
                    label="Descrição"
                    name="description"
                    placeholder="Explique para que este cargo será utilizado."
                    maxLength={255}
                    rows={4}
                    labelClassName="text-j-gray-700"
                    className={LIGHT_FIELD_CLASS}
                />

                <div className="flex w-full gap-3 border-t border-j-gray-200 pt-5">
                    <Button
                        type="submit"
                        disabled={mutation.isPending}
                        className="flex-1 bg-j-blue-700 text-j-white hover:bg-j-blue-800 hover:text-j-white"
                    >
                        {mutation.isPending ? "Criando..." : "Criar cargo"}
                    </Button>
                </div>
            </Form>
        </div>
    );
}

export default CreateRoleModal;
