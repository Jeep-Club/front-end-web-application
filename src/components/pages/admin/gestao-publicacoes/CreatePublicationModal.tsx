"use client";

import { useRef } from "react";
import styles from "./CreatePublicationModal.module.css";
import { useFormContext } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Newspaper, X } from "lucide-react";
import { Form } from "@/components/common/form";
import { Button, ButtonIcon } from "@/components/common/button";
import { InputRegister } from "@/components/common/input/input-register";
import { SelectRegister } from "@/components/common/select/select-register";
import { RichTextRegister } from "@/components/common/rich-text/RichTextRegister";
import { InputFile } from "@/components/common/input/file";
import { useModal } from "@/providers/ModalProvider";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { publicationCreationTypes } from "@/config/publicationCreation";
import { publicationFormSchema, type PublicationFormData, type CreatePublicationRequest } from "@/schemas/publications/create";
import { createPublicationAction } from "@/actions/publications/create";
import { uploadImageAction } from "@/actions/media/upload-image";

function Fields() {
    const { setClose } = useModal();
    const { watch, formState: { isSubmitting } } = useFormContext<PublicationFormData>();
    const type = watch("type");
    const photos = watch("photos") ?? [];
    const permissions = useUserStore((state) => state.permissions);
    const types = publicationCreationTypes.filter((entry) => hasPermission(permissions, "PUBLICATIONS", entry.action));
    return (
        <>
            <fieldset disabled={isSubmitting} className={`${styles.fields} flex w-full min-w-0 flex-col gap-5`}>
                <div className="flex flex-col gap-4 rounded-2xl border border-j-gray-200 bg-j-gray-100/60 p-4 md:p-5">
                <SelectRegister name="type" label="Tipo de publicação" required>
                    {types.map((entry) => <option key={entry.type} value={entry.type}>{entry.label}</option>)}
                </SelectRegister>
                <p className="text-sm text-j-gray-500">{type === "SERVICE" ? "O serviço será enviado para aprovação e aparecerá no feed após ser aprovado. É necessário ter associação ativa." : "A publicação será salva como rascunho. Publicar no feed é uma ação separada."}</p>
                </div>
                <div className="flex flex-col gap-4 rounded-2xl border border-j-gray-200 bg-j-gray-100/60 p-4 md:p-5">
                <InputRegister name="title" label="Título" maxLength={200} required />
                <RichTextRegister name="content" label="Conteúdo" required />
                {type === "EVENT" && <>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <InputRegister name="startsAt" label="Início" type="datetime-local" required />
                        <InputRegister name="endsAt" label="Término (opcional)" type="datetime-local" />
                    </div>
                    <p className="text-xs text-j-gray-500">Use o horário local. Este cadastro cria um evento sem cobranças.</p>
                </>}
                {type === "SERVICE" && <div className="grid gap-4 sm:grid-cols-2">
                    <InputRegister name="amount" label="Valor anunciado (R$)" inputMode="decimal" placeholder="100,00" required />
                    <InputRegister name="contactPhone" label="Telefone de contato" type="tel" maxLength={30} required />
                </div>}
                </div>
                <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-j-gray-200 bg-j-gray-100/60 p-4 md:p-5">
                <InputFile.Image className={styles.gallery} name="photos" label="Imagens" maxFiles={5} maxSizeMB={5} cropShape="landscape" required />
                <p className="text-xs text-j-gray-500">Envie de 1 a 5 imagens JPEG, PNG ou WebP, com até 5 MiB cada.</p>
                {photos.length > 0 && <SelectRegister name="primaryIndex" label="Imagem de capa" required>
                    {photos.map((file, index) => <option key={index} value={String(index)}>{index + 1}. {file.name}</option>)}
                </SelectRegister>}
                </div>
            </fieldset>
            <div className="flex w-full flex-col-reverse gap-3 border-t border-j-gray-200 pt-5 sm:flex-row">
                <Button disabled={isSubmitting} onClick={setClose} className="flex-1 border-2 border-j-gray-200 bg-j-white text-j-gray-600 hover:border-j-gray-300 hover:bg-j-gray-100 hover:text-j-gray-700">Cancelar</Button>
            <Button type="submit" disabled={isSubmitting || !types.some((entry) => entry.type === type)} className="flex-1 bg-j-blue-700 text-j-white hover:bg-j-blue-800 hover:text-j-white">
                {isSubmitting ? "Salvando..." : type === "SERVICE" ? "Enviar para aprovação" : "Criar rascunho"}
            </Button>
            </div>
        </>
    );
}

export function CreatePublicationModal() {
    const { setClose } = useModal();
    const permissions = useUserStore((state) => state.permissions);
    const types = publicationCreationTypes.filter((entry) => hasPermission(permissions, "PUBLICATIONS", entry.action));
    const uploads = useRef(new Map<File, string>());
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (data: PublicationFormData) => {
            const config = publicationCreationTypes.find((entry) => entry.type === data.type)!;
            if (!hasPermission(useUserStore.getState().permissions, "PUBLICATIONS", config.action)) throw new Error("Você não tem permissão para criar este tipo de publicação.");
            const images = [];
            for (const [position, file] of data.photos.entries()) {
                let storageKey = uploads.current.get(file);
                if (!storageKey) {
                    const form = new FormData();
                    form.set("file", file);
                    storageKey = await uploadImageAction(form);
                    uploads.current.set(file, storageKey);
                }
                images.push({ storageKey, position, primary: position === Number(data.primaryIndex) });
            }
            const common = { title: data.title, content: data.content, images };
            const payload: CreatePublicationRequest = data.type === "EVENT"
                ? { ...common, type: "EVENT", startsAt: new Date(data.startsAt).toISOString(), endsAt: data.endsAt ? new Date(data.endsAt).toISOString() : null }
                : data.type === "SERVICE"
                    ? { ...common, type: "SERVICE", amount: Number(data.amount.replace(",", ".")), contactPhone: data.contactPhone }
                    : { ...common, type: "NOTICE" };
            return createPublicationAction(payload);
        },
        onSuccess: (result) => {
            toast.success(result.type === "SERVICE" ? "Solicitação enviada para aprovação!" : "Rascunho criado com sucesso!");
            void queryClient.invalidateQueries({ queryKey: ["publications"] });
            setClose();
        },
        onError: (error) => toast.error(error.message || "Não foi possível criar a publicação."),
    });
    if (!types.length) return null;
    return (
        <div role="dialog" aria-modal="true" aria-labelledby="create-publication-title" className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-y-auto overflow-x-hidden rounded-3xl bg-j-white shadow-2xl">
            <ButtonIcon aria-label="Fechar" disabled={mutation.isPending} onClick={setClose} className="absolute right-4 top-4 z-10 rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800 md:right-6 md:top-6"><X size={20} /></ButtonIcon>
            <header className="border-b border-j-gray-200 px-5 pb-5 pr-16 pt-6 md:px-8 md:pb-6 md:pr-20 md:pt-8">
                <div className="flex items-center gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300 shadow-sm"><Newspaper size={20} /></span><h2 id="create-publication-title" className="text-xl font-extrabold text-j-blue-800 md:text-2xl">Criar publicação</h2></div>
                <p className="mt-2 text-sm text-j-gray-500">Escolha o tipo e preencha os dados da publicação.</p>
            </header>
            <Form<PublicationFormData> schema={publicationFormSchema} formOptions={{ defaultValues: { type: types[0].type, title: "", content: "", photos: [], primaryIndex: "0", startsAt: "", endsAt: "", amount: "", contactPhone: "" } }} onSubmit={async (data) => { try { await mutation.mutateAsync(data); } catch { /* A mensagem é apresentada pelo onError. */ } }} onError={() => toast.error("Confira os campos destacados.")} className="px-5 py-5 md:px-8 md:py-6">
                <Fields />
            </Form>
        </div>
    );
}