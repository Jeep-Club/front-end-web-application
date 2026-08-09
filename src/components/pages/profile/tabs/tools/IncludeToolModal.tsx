'use client';

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { X, Wrench, LoaderCircle } from "lucide-react";
import { Form } from "@/components/common/form";
import { Button, ButtonIcon } from "@/components/common/button";
import { InputRegister } from "@/components/common/input/input-register";
import { TextareaRegister } from "@/components/common/textarea/textarea-register";
import { useModal } from "@/providers/ModalProvider";
import { createToolFormSchema } from "@/schemas/tools/create";
import { createToolAction } from "@/actions/tools/create";
import { editToolFormSchema } from "@/schemas/tools/update";
import { updateToolAction } from "@/actions/tools/update";
import { getToolDetailAction } from "@/actions/tools/detail";

interface IncludeToolModalProps {
    toolId?: number;
}

export function IncludeToolModal({ toolId }: IncludeToolModalProps) {
    const { setClose } = useModal();
    const queryClient = useQueryClient();
    const isEditMode = !!toolId;

    const { data: tool, isLoading: isLoadingTool } = useQuery({
        queryKey: ["tools", "detail", toolId],
        queryFn: () => getToolDetailAction(toolId!),
        enabled: isEditMode,
    });

    const mutation = useMutation({
        mutationFn: (data: CreateToolFormData | UpdateToolFormData) =>
            isEditMode && toolId
                ? updateToolAction(toolId, data)
                : createToolAction(data as CreateToolRequest),
        onSuccess: () => {
            toast.success(isEditMode ? "Ferramenta atualizada com sucesso!" : "Ferramenta cadastrada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["tools", "list"] });
            setClose();
        },
        onError: (error) => toast.error(error.message || (isEditMode ? "Erro ao editar ferramenta." : "Erro ao cadastrar ferramenta.")),
    });

    return (
        <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl bg-j-white shadow-2xl">
            <ButtonIcon
                onClick={setClose}
                className="absolute right-4 top-4 z-10 rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800"
            >
                <X className="h-5 w-5" />
            </ButtonIcon>

            <header className="border-b border-j-gray-200 px-6 pb-5 pr-16 pt-6">
                <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300 shadow-sm">
                        <Wrench size={20} />
                    </span>
                    <div>
                        <h2 className="text-xl font-extrabold text-j-blue-800">
                            {isEditMode ? "Editar ferramenta" : "Incluir ferramenta"}
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-j-gray-500">
                            {isEditMode
                                ? "Atualize o nome ou a descrição da ferramenta."
                                : "Cadastre uma ferramenta ou equipamento vinculado ao seu perfil."}
                        </p>
                    </div>
                </div>
            </header>

            {isEditMode && isLoadingTool ? (
                <div className="flex items-center justify-center gap-2 px-6 py-16 text-j-gray-500">
                    <LoaderCircle size={20} className="animate-spin" />
                    Carregando dados da ferramenta...
                </div>
            ) : (
                <Form<CreateToolFormData | UpdateToolFormData>
                    schema={isEditMode ? editToolFormSchema : createToolFormSchema}
                    onSubmit={(data) => mutation.mutateAsync(data)}
                    onError={(errors) => console.log(errors)}
                    className="gap-4 px-6 py-6"
                >
                    <InputRegister
                        label="Nome"
                        name="name"
                        placeholder="Ex: Macaco Hidráulico"
                        value={tool?.name}
                        required
                    />
                    <TextareaRegister
                        label="Descrição"
                        name="description"
                        placeholder="Ex: Macaco tipo jacaré, 2 toneladas."
                        value={tool?.description}
                    />

                    <Button type="submit" disabled={mutation.isPending} className="mt-2 w-full">
                        {mutation.isPending
                            ? (isEditMode ? "Salvando..." : "Cadastrando...")
                            : (isEditMode ? "Salvar" : "Cadastrar ferramenta")}
                    </Button>
                </Form>
            )}
        </div>
    );
}

export default IncludeToolModal;