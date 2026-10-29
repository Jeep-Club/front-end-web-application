'use client';
import { ActionError } from '@/utils/http/ActionError';

import { Button,ButtonIcon } from "@/components/common/button";
import { Form } from "@/components/common/form";
import { InputFile } from '@/components/common/input/file';
import { InputRegister } from "@/components/common/input/input-register";
import { TextareaRegister } from "@/components/common/textarea/textarea-register";
import { useModal } from "@/providers/ModalProvider";
import { createToolFormSchema } from "@/schemas/tools/create";
import { editToolFormSchema } from "@/schemas/tools/update";
import { uploadImageAction } from '@/server/actions/media/upload-image';
import { createToolAction } from "@/server/actions/tools/create";
import { getToolDetailAction } from "@/server/actions/tools/detail";
import { updateToolPhotoAction } from '@/server/actions/tools/photo';
import { updateToolAction } from "@/server/actions/tools/update";
import { getMediaImageUrl } from '@/utils/media/imageUrl';
import { useMutation,useQuery,useQueryClient } from "@tanstack/react-query";
import { LoaderCircle,Wrench,X } from "lucide-react";
import { useRef } from 'react';
import { useFormContext,useWatch } from 'react-hook-form';
import toast from "react-hot-toast";

function ToolPhotoField({ storageKey }: { storageKey?: string | null }) {
    const { control, setValue } = useFormContext<CreateToolFormData>();
    const removed = useWatch({ control, name: 'removePhoto' });
    const files = useWatch({ control, name: 'photo' });
    return <section className="w-full rounded-xl border border-j-gray-200 bg-j-gray-100/50 p-3">
        {storageKey && !removed && !files?.length && <div className="relative mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getMediaImageUrl(storageKey)} alt="Foto atual da ferramenta" className="mb-2 aspect-video w-full rounded-lg object-cover" />
            <button type="button" aria-label="Remover foto atual da ferramenta" title="Remover foto atual" onClick={() => setValue('removePhoto', true, { shouldDirty: true, shouldValidate: true })} className="absolute right-2 top-2 z-10 flex size-9 items-center justify-center rounded-full bg-white text-red-600 shadow-md transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"><X size={20} aria-hidden="true" /></button>
        </div>}
        {removed && <div className="mb-2 flex items-center justify-between gap-2 text-xs text-j-gray-600"><span>A foto será removida ao salvar.</span><button type="button" onClick={() => setValue('removePhoto', false)} className="font-bold text-j-blue-800">Desfazer</button></div>}
        <InputFile.Image name="photo" label="Foto da ferramenta (opcional)" maxFiles={1} maxSizeMB={5} cropShape="landscape" className="[&_label]:font-semibold [&_label]:!text-j-gray-700 [&_p]:!text-j-gray-600 [&_svg]:!text-j-gray-400 [&>div]:!border-j-gray-200 [&>div]:!bg-j-white [&>div]:py-4" />
    </section>;
}

const LIGHT_FIELD_CLASS = "border-j-gray-200 bg-j-gray-100 px-4 py-3 text-j-gray-700 placeholder:text-j-gray-400 focus:bg-j-white";

interface IncludeToolModalProps {
    toolId?: number;
}

export function IncludeToolModal({ toolId }: IncludeToolModalProps) {
    const { setClose } = useModal();
    const queryClient = useQueryClient();
    const isEditMode = !!toolId;
    const savedIdRef = useRef<number | undefined>(toolId);

    const { data: tool, isLoading: isLoadingTool } = useQuery({
        queryKey: ["tools", "detail", toolId],
        queryFn: () => getToolDetailAction(toolId!),
        enabled: isEditMode,
    });

    const mutation = useMutation({
        mutationFn: async (data: CreateToolFormData | UpdateToolFormData) => {
            let storageKey: string | undefined;
            if (data.photo?.[0]) {
                const upload = new FormData();
                upload.set('file', data.photo[0]);
                storageKey = await uploadImageAction(upload);
            }
            const request = { name: data.name, description: data.description };
            const saved = savedIdRef.current
                ? await updateToolAction(savedIdRef.current, request)
                : await createToolAction(request as CreateToolRequest);
            savedIdRef.current = saved.id;
            queryClient.invalidateQueries({ queryKey: ['tools', 'list'] });
            if (storageKey || data.removePhoto) {
                try {
                    return await updateToolPhotoAction(saved.id, storageKey ?? null);
                } catch (error) {
                    throw new ActionError('Os dados da ferramenta foram salvos, mas a foto não. Tente salvar novamente.', { cause: error });
                }
            }
            return saved;
        },
        onSuccess: () => {
            toast.success(isEditMode ? "Ferramenta atualizada com sucesso!" : "Ferramenta cadastrada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["tools", "list"] });
            queryClient.invalidateQueries({ queryKey: ["tools", "detail"] });
            setClose();
        },

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
                disabled={mutation.isPending}
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
                        <h2 className="text-xl font-extrabold text-j-blue-800 md:text-2xl">
                            {isEditMode ? "Editar ferramenta" : "Incluir ferramenta"}
                        </h2>
                        <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                            {isEditMode
                                ? "Atualize o nome ou a descrição da ferramenta."
                                : "Cadastre uma ferramenta ou equipamento vinculado ao seu perfil."}
                        </p>
                    </div>
                </div>
            </header>

            {isEditMode && isLoadingTool ? (
                <div className="flex items-center justify-center gap-2 px-5 py-16 text-j-gray-500 md:px-8">
                    <LoaderCircle size={20} className="animate-spin" />
                    Carregando dados da ferramenta...
                </div>
            ) : (
                <Form<CreateToolFormData | UpdateToolFormData>
                    schema={isEditMode ? editToolFormSchema : createToolFormSchema}
                    onSubmit={(data) => mutation.mutateAsync(data)}
                    onError={(errors) => console.log(errors)}
                    className="gap-4 px-5 py-5 md:px-8 md:py-6"
                >
                    <fieldset disabled={mutation.isPending} className="flex w-full flex-col gap-4">
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

                    <ToolPhotoField storageKey={tool?.photoStorageKey} />
                    </fieldset>
                    <div className="flex w-full gap-3 border-t border-j-gray-200 pt-5">
                        <Button
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex-1 bg-j-blue-700 text-j-white hover:bg-j-blue-800 hover:text-j-white"
                        >
                            {mutation.isPending
                                ? (isEditMode ? "Salvando..." : "Cadastrando...")
                                : (isEditMode ? "Salvar alterações" : "Cadastrar ferramenta")}
                        </Button>
                    </div>
                </Form>
            )}
        </div>
    );
}

export default IncludeToolModal;
