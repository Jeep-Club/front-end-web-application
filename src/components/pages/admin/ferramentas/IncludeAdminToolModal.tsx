'use client';

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useController, useFormContext, useWatch } from "react-hook-form";
import { MemberSelector, type MemberOption } from "@/components/pages/admin/MemberSelector";
import toast from "react-hot-toast";
import { X, Wrench, LoaderCircle, AlertCircle } from "lucide-react";
import { Form } from "@/components/common/form";
import { Button, ButtonIcon } from "@/components/common/button";
import { InputRegister } from "@/components/common/input/input-register";
import { TextareaRegister } from "@/components/common/textarea/textarea-register";
import { InputFile } from "@/components/common/input/file";
import { ReadOnlyField } from "@/components/common/ReadOnlyField";
import { useModal } from "@/providers/ModalProvider";
import { createAdminToolFormSchema } from "@/schemas/admin/tools";
import { editToolFormSchema } from "@/schemas/tools/update";
import { createToolAdminAction } from "@/server/actions/admin/tools/create";
import { updateToolAdminAction } from "@/server/actions/admin/tools/update";
import { getToolDetailAdminAction } from "@/server/actions/admin/tools/detail";
import { updateToolPhotoAdminAction } from "@/server/actions/admin/tools/photo";
import { uploadImageAction } from "@/server/actions/media/upload-image";
import { getMediaImageUrl } from "@/utils/media/imageUrl";

function ToolOwnerField() {
    const { control } = useFormContext<CreateAdminToolFormData>();
    const { field, fieldState } = useController({ name: "userId", control });
    const [member, setMember] = useState<MemberOption | null>(null);
    return <div className="flex flex-col gap-2">
        <MemberSelector value={member} onChange={next => { setMember(next); field.onChange(next?.id ?? ""); }} />
        {fieldState.error && <p role="alert" className="text-sm text-red-500">Pesquise e selecione o associado.</p>}
    </div>;
}

function ToolPhotoField({ storageKey }: { storageKey?: string | null }) {
    const { control, setValue } = useFormContext<CreateAdminToolFormData | UpdateToolFormData>();
    const removed = useWatch({ control, name: "removePhoto" });
    const files = useWatch({ control, name: "photo" });

    return (
        <section
            tabIndex={0}
            aria-label="Selecionar foto da ferramenta"
            onClick={event => {
                if (event.currentTarget.closest('fieldset:disabled') || (event.target as Element).closest('[data-file-dropzone], button, input')) return;
                event.preventDefault();
                event.currentTarget.querySelector<HTMLInputElement>('input[type="file"]')?.click();
            }}
            onKeyDown={event => {
                if (!event.currentTarget.closest('fieldset:disabled') && event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    event.currentTarget.querySelector<HTMLInputElement>('input[type="file"]')?.click();
                }
            }}
            className="w-full cursor-pointer rounded-xl border border-j-gray-200 bg-j-gray-100/50 p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-700">
            {storageKey && !removed && !files?.length && (
                <div className="relative mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={getMediaImageUrl(storageKey)}
                        alt="Foto atual da ferramenta"
                        className="mb-2 aspect-video w-full rounded-lg object-cover"
                    />
                    <button
                        type="button"
                        aria-label="Remover foto atual da ferramenta"
                        title="Remover foto atual"
                        onClick={() => setValue("removePhoto", true, { shouldDirty: true, shouldValidate: true })}
                        className="absolute right-2 top-2 z-10 flex size-9 items-center justify-center rounded-full bg-white text-red-600 shadow-md transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>
            )}
            {removed && (
                <div className="mb-2 flex items-center justify-between gap-2 text-xs text-j-gray-600">
                    <span>A foto será removida ao salvar.</span>
                    <button
                        type="button"
                        onClick={() => setValue("removePhoto", false)}
                        className="font-bold text-j-blue-800"
                    >
                        Desfazer
                    </button>
                </div>
            )}
            <InputFile.Image
                name="photo"
                label="Foto da ferramenta (opcional)"
                maxFiles={1}
                maxSizeMB={5}
                cropShape="landscape"
                className="[&_label]:font-semibold [&_label]:!text-j-gray-700 [&_p]:!text-j-gray-600 [&_svg]:!text-j-gray-400 [&>div]:!border-j-gray-200 [&>div]:!bg-j-white [&>div]:py-4"
            />
        </section>
    );
}

const LIGHT_FIELD_CLASS =
    "border-j-gray-200 bg-j-gray-100 px-4 py-3 text-j-gray-700 placeholder:text-j-gray-400 focus:bg-j-white";

interface IncludeAdminToolModalProps {
    toolId?: number;
}

export function IncludeAdminToolModal({ toolId }: IncludeAdminToolModalProps) {
    const { setClose } = useModal();
    const queryClient = useQueryClient();
    const isEditMode = !!toolId;
    const savedIdRef = useRef<number | undefined>(toolId);

    const { data: tool, isLoading: isLoadingTool, error: loadError, refetch } = useQuery({
        queryKey: ["admin", "tools", "detail", toolId],
        queryFn: () => getToolDetailAdminAction(toolId!),
        enabled: isEditMode,
    });

    const mutation = useMutation({
        mutationFn: async (data: CreateAdminToolFormData | UpdateToolFormData) => {
            let storageKey: string | undefined;
            if (data.photo?.[0]) {
                const upload = new FormData();
                upload.set("file", data.photo[0]);
                storageKey = await uploadImageAction(upload);
            }

            const request = { name: data.name, description: data.description };
            const saved = savedIdRef.current
                ? await updateToolAdminAction(savedIdRef.current, request)
                : await createToolAdminAction(
                    (data as CreateAdminToolFormData).userId,
                    request as CreateToolRequest,
                );

            savedIdRef.current = saved.id;
            queryClient.invalidateQueries({ queryKey: ["admin", "tools"] });
            queryClient.invalidateQueries({ queryKey: ["tools"] });

            if (storageKey || data.removePhoto) {
                try {
                    return await updateToolPhotoAdminAction(saved.id, storageKey ?? null);
                } catch (error) {
                    throw new Error(
                        `Os dados da ferramenta foram salvos, mas a foto não. Tente salvar novamente. ${error instanceof Error ? error.message : ""}`,
                    );
                }
            }

            return saved;
        },
        onSuccess: () => {
            toast.success(
                isEditMode
                    ? "Ferramenta atualizada com sucesso!"
                    : "Ferramenta cadastrada com sucesso!",
            );
            queryClient.invalidateQueries({ queryKey: ["admin", "tools"] });
            queryClient.invalidateQueries({ queryKey: ["tools"] });
            setClose();
        },
        onError: (error) =>
            toast.error(
                error.message ||
                    (isEditMode ? "Erro ao editar ferramenta." : "Erro ao cadastrar ferramenta."),
            ),
    });

    const handleSubmit = async (data: CreateAdminToolFormData | UpdateToolFormData) => {
        try {
            await mutation.mutateAsync(data);
        } catch {
            /* onError presents the error. */
        }
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
                            {isEditMode ? "Editar ferramenta" : "Cadastrar ferramenta"}
                        </h2>
                        <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                            {isEditMode
                                ? "Atualize o nome, descrição ou foto da ferramenta do associado."
                                : "Cadastre uma nova ferramenta vinculada a um associado ativo do clube."}
                        </p>
                    </div>
                </div>
            </header>

            {isEditMode && isLoadingTool ? (
                <div className="flex items-center justify-center gap-2 px-5 py-16 text-j-gray-500 md:px-8">
                    <LoaderCircle size={20} className="animate-spin" />
                    Carregando dados da ferramenta...
                </div>
            ) : isEditMode && (loadError || !tool) ? (
                <div role="alert" className="flex flex-col items-center justify-center gap-3 px-5 py-12 text-center md:px-8">
                    <AlertCircle size={32} className="text-red-500" />
                    <p className="text-sm text-j-gray-600">
                        {loadError instanceof Error ? loadError.message : "Não foi possível carregar os dados da ferramenta."}
                    </p>
                    <Button type="button" onClick={() => void refetch()}>
                        Tentar novamente
                    </Button>
                </div>
            ) : (
                <Form<CreateAdminToolFormData | UpdateToolFormData>
                    schema={isEditMode ? editToolFormSchema : createAdminToolFormSchema}
                    onSubmit={handleSubmit}
                    onError={() => undefined}
                    className="gap-4 px-5 py-5 md:px-8 md:py-6"
                >
                    <fieldset disabled={mutation.isPending} className="flex w-full flex-col gap-4">
                        {mutation.error && (
                            <div
                                role="alert"
                                className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
                            >
                                {mutation.error.message}
                            </div>
                        )}

                        {isEditMode && tool ? (
                            <ReadOnlyField
                                label="ID do associado (Proprietário)"
                                value={tool.userId}
                                labelClassName="text-j-gray-700"
                                valueClassName="border-j-gray-200 bg-j-gray-100 text-j-gray-700"
                            />
                        ) : (
                            <ToolOwnerField />
                        )}

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
                            type="button"
                            onClick={setClose}
                            disabled={mutation.isPending}
                            className="flex-1 border-2 border-j-gray-200 bg-j-white text-j-gray-600 hover:border-j-gray-300 hover:bg-j-gray-100 hover:text-j-gray-700"
                        >
                            Cancelar
                        </Button>
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

export default IncludeAdminToolModal;
