'use client';

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { X, KeyRound, LoaderCircle } from "lucide-react";
import { Form } from "@/components/common/form";
import { Button, ButtonIcon } from "@/components/common/button";
import { InputRegister } from "@/components/common/input/input-register";
import { TextareaRegister } from "@/components/common/textarea/textarea-register";
import { useModal } from "@/providers/ModalProvider";
import { updateRoleRequestSchema } from "@/schemas/authorization/update";
import { getRoleAction } from "@/actions/authorization/get-role";
import { updateRoleAction } from "@/actions/authorization/update-role";

const LIGHT_FIELD_CLASS = "border-j-gray-200 bg-j-gray-100 px-4 py-3 text-j-gray-700 placeholder:text-j-gray-400 focus:bg-j-white";

interface EditRoleModalProps {
    roleId: number;
}

export function EditRoleModal({ roleId }: EditRoleModalProps) {
    const { setClose } = useModal();
    const queryClient = useQueryClient();

    const { data: role, isLoading } = useQuery({
        queryKey: ["authorization", "roles", roleId],
        queryFn: () => getRoleAction(roleId),
    });

    const mutation = useMutation({
        mutationFn: (data: UpdateRoleRequest) => updateRoleAction(roleId, data),
        onSuccess: () => {
            toast.success("Cargo atualizado com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["authorization", "roles"] });
            setClose();
        },
        onError: (error) => toast.error(error.message || "Erro ao atualizar cargo."),
    });

    const handleSubmit = async (data: UpdateRoleRequest) => {
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
                <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300 shadow-sm">
                        <KeyRound size={20} />
                    </span>
                    <div>
                        <h2 className="text-xl font-extrabold text-j-blue-800 md:text-2xl">
                            Editar cargo
                        </h2>
                        <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                            Atualize o nome e a descrição deste cargo.
                        </p>
                    </div>
                </div>
            </header>

            {isLoading || !role ? (
                <div className="flex items-center justify-center gap-2 px-5 py-16 text-j-gray-500 md:px-8">
                    <LoaderCircle size={20} className="animate-spin" />
                    Carregando dados do cargo...
                </div>
            ) : (
                <Form<UpdateRoleRequest>
                    schema={updateRoleRequestSchema}
                    onSubmit={handleSubmit}
                    onError={(errors) => console.log(errors)}
                    className="gap-4 px-5 py-5 md:px-8 md:py-6"
                >
                    <InputRegister
                        label="Nome do cargo"
                        name="name"
                        placeholder="Ex.: Administrador de autorização"
                        maxLength={100}
                        value={role.name}
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
                        value={role.description ?? undefined}
                        labelClassName="text-j-gray-700"
                        className={LIGHT_FIELD_CLASS}
                    />

                    <div className="flex w-full gap-3 border-t border-j-gray-200 pt-5">
                        <Button
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex-1 bg-j-blue-700 text-j-white hover:bg-j-blue-800 hover:text-j-white"
                        >
                            {mutation.isPending ? "Salvando..." : "Salvar alterações"}
                        </Button>
                    </div>
                </Form>
            )}
        </div>
    );
}

export default EditRoleModal;
