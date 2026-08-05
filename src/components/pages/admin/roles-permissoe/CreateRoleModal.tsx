'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { X, KeyRound } from "lucide-react";
import { Form } from "@/components/common/form";
import { Button, ButtonIcon } from "@/components/common/button";
import { InputRegister } from "@/components/common/input/input-register";
import { TextareaRegister } from "@/components/common/textarea/textarea-register";
import { useModal } from "@/providers/ModalProvider";
import { createRoleRequestSchema } from "@/schemas/authorization/role";
import { createRoleAction } from "@/actions/authorization/create-role";

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
                    <KeyRound size={20} />
                </span>
                <h2 className="text-lg md:text-2xl font-extrabold text-j-white">
                    Criar cargo
                </h2>
                <p className="text-xs md:text-sm text-j-transparent-white">
                    Um cargo define o que os administradores com ele podem acessar e fazer.
                </p>
            </div>

            <Form<CreateRoleRequest>
                schema={createRoleRequestSchema}
                onSubmit={handleSubmit}
                onError={(errors) => console.log(errors)}
                className="gap-4"
            >
                <InputRegister
                    label="Nome do cargo"
                    name="name"
                    placeholder="Ex.: Administrador de autorização"
                    maxLength={100}
                    required
                />

                <TextareaRegister
                    label="Descrição"
                    name="description"
                    placeholder="Explique para que este cargo será utilizado."
                    maxLength={255}
                    rows={4}
                />

                <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="w-full bg-j-yellow-300 text-j-black hover:bg-j-yellow-500 hover:text-j-black"
                >
                    {mutation.isPending ? "Criando..." : "Criar cargo"}
                </Button>
            </Form>
        </div>
    );
}

export default CreateRoleModal;
