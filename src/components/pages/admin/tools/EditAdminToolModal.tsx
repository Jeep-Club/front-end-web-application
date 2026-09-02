'use client';

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { X, Wrench, LoaderCircle } from "lucide-react";
import { Form } from "@/components/common/form";
import { Button, ButtonIcon } from "@/components/common/button";
import { InputRegister } from "@/components/common/input/input-register";
import { TextareaRegister } from "@/components/common/textarea/textarea-register";
import { useModal } from "@/providers/ModalProvider";
import { editToolFormSchema } from "@/schemas/tools/update";
import { getAdminToolDetailAction } from "@/actions/admin/tools/detail";
import { updateAdminToolAction } from "@/actions/admin/tools/update";

const LIGHT_FIELD_CLASS = "border-j-gray-200 bg-j-gray-100 px-4 py-3 text-j-gray-700 placeholder:text-j-gray-400 focus:bg-j-white";

interface EditAdminToolModalProps {
    toolId: number;
}

export function EditAdminToolModal({ toolId }: EditAdminToolModalProps) {
    const { setClose } = useModal();
    const queryClient = useQueryClient();

    const { data: tool, isLoading: isLoadingTool } = useQuery({
        queryKey: ["admin", "tools", "detail", toolId],
        queryFn: () => getAdminToolDetailAction(toolId),
    });

    const mutation = useMutation({
        mutationFn: (data: UpdateToolFormData) => updateAdminToolAction(toolId, data),
        onSuccess: () => {
            toast.success("Ferramenta atualizada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["admin", "tools"] });
            setClose();
        },
        onError: (error) => toast.error(error.message || "Erro ao editar ferramenta."),
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
                <X className="h-5 w-5 md:h-[22px] md:w-[22px]" />
            </ButtonIcon>

            <header className="border-b border-j-gray-200 px-5 pb-5 pr-16 pt-6 md:px-8 md:pb-6 md:pr-20 md:pt-8">
                <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300 shadow-sm">
                        <Wrench size={20} />
                    </span>
                    <div>
                        <h2 className="text-xl font-extrabold text-j-blue-800 md:text-2xl">Editar ferramenta</h2>
                        <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                            Alteração administrativa — vale para qualquer usuário.
                        </p>
                    </div>
                </div>
            </header>

            {isLoadingTool ? (
                <div className="flex items-center justify-center gap-2 px-5 py-16 text-j-gray-500 md:px-8">
                    <LoaderCircle size={20} className="animate-spin" />
                    Carregando dados da ferramenta...
                </div>
            ) : (
                <Form<UpdateToolFormData>
                    schema={editToolFormSchema}
                    onSubmit={(data) => mutation.mutateAsync(data)}
                    onError={(errors) => console.log(errors)}
                    className="gap-4 px-5 py-5 md:px-8 md:py-6"
                >
                    <div className="flex w-full flex-col gap-1.5">
                        <span className="text-xs font-bold text-j-gray-700 md:text-sm">Usuário dono</span>
                        <div className="w-full rounded-lg border-2 border-j-gray-200 bg-j-gray-100 px-2.5 py-2 text-sm font-light text-j-gray-500 md:text-base">
                            Usuário #{tool?.userId}
                        </div>
                    </div>

                    <InputRegister
                        label="Nome"
                        name="name"
                        placeholder="Ex: Macaco Hidráulico"
                        value={tool?.name}
                        required
                        labelClassName="text-j-gray-700"
                        className={LIGHT_FIELD_CLASS}
                    />
                    <TextareaRegister
                        label="Descrição"
                        name="description"
                        placeholder="Ex: Macaco tipo jacaré, 2 toneladas."
                        value={tool?.description}
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

export default EditAdminToolModal;