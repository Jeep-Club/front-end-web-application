"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, LoaderCircle, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createPublicationAction } from "@/actions/admin/publications/create";
import { updatePublicationAction } from "@/actions/admin/publications/update";
import { Button, ButtonIcon } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { Select } from "@/components/common/select";
import { Textarea } from "@/components/common/textarea";

const mediaFormSchema = z.object({ id: z.string().optional(), type: z.enum(["image", "video"]), url: z.url("Informe uma URL válida."), thumbnailUrl: z.union([z.url("Informe uma URL válida."), z.literal("")]), alt: z.string(), caption: z.string() });
const formSchema = z.object({
    type: z.enum(["event", "notice", "service"]), title: z.string().trim().min(3, "O título deve ter pelo menos 3 caracteres.").max(150), summary: z.string().max(300), content: z.string().trim().min(1, "Informe o conteúdo."),
    thumbnailUrl: z.union([z.url("Informe uma URL válida."), z.literal("")]), status: z.enum(["draft", "published", "archived"]), media: z.array(mediaFormSchema),
    startAt: z.string(), endAt: z.string(), addressId: z.string(), maxParticipants: z.string(), requiresConfirmation: z.boolean(), expiresAt: z.string(), noticePriority: z.enum(["low", "medium", "high"]), serviceCategory: z.enum(["benefit", "help", "general"]),
}).superRefine((value, context) => {
    if (value.type === "event") {
        if (!value.startAt) context.addIssue({ code: "custom", path: ["startAt"], message: "Informe o início." });
        if (!value.endAt) context.addIssue({ code: "custom", path: ["endAt"], message: "Informe o término." });
        if (value.startAt && value.endAt && new Date(value.endAt) <= new Date(value.startAt)) context.addIssue({ code: "custom", path: ["endAt"], message: "O término deve ser posterior ao início." });
        if (!/^\d+$/.test(value.addressId) || BigInt(value.addressId) <= BigInt(0)) context.addIssue({ code: "custom", path: ["addressId"], message: "Informe um ID positivo." });
        if (value.maxParticipants && (!/^\d+$/.test(value.maxParticipants) || Number(value.maxParticipants) <= 0)) context.addIssue({ code: "custom", path: ["maxParticipants"], message: "Informe um número positivo." });
    }
});
type PublicationFormValues = z.infer<typeof formSchema>;

function localDate(value?: string | null): string { if (!value) return ""; const date = new Date(value); const offset = date.getTimezoneOffset() * 60_000; return new Date(date.getTime() - offset).toISOString().slice(0, 16); }
function defaults(item?: Publication): PublicationFormValues {
    return { type: item?.type ?? "event", title: item?.title ?? "", summary: item?.summary ?? "", content: item?.content ?? "", thumbnailUrl: item?.thumbnailUrl ?? "", status: item?.status ?? "draft", media: item?.media.map((m) => ({ id: m.id.toString(), type: m.type, url: m.url, thumbnailUrl: m.thumbnailUrl ?? "", alt: m.alt ?? "", caption: m.caption ?? "" })) ?? [],
        startAt: item?.type === "event" ? localDate(item.startAt) : "", endAt: item?.type === "event" ? localDate(item.endAt) : "", addressId: item?.type === "event" ? item.addressId.toString() : "", maxParticipants: item?.type === "event" ? item.maxParticipants?.toString() ?? "" : "", requiresConfirmation: item?.type === "event" ? item.requiresConfirmation : false,
        expiresAt: item?.type === "notice" ? localDate(item.expiresAt) : "", noticePriority: item?.type === "notice" ? item.noticePriority : "medium", serviceCategory: item?.type === "service" ? item.serviceCategory : "general" };
}
const label = "text-j-gray-700"; const field = "border border-j-gray-200 bg-j-gray-100 text-j-gray-700 placeholder:text-j-gray-400";

export function PublicationForm({ publication }: { publication?: Publication }) {
    const router = useRouter();
    const form = useForm<PublicationFormValues>({ resolver: zodResolver(formSchema), defaultValues: defaults(publication), shouldUnregister: false });
    const { fields, append, remove } = useFieldArray({ control: form.control, name: "media" });
    const type = useWatch({ control: form.control, name: "type" });
    const mutation = useMutation({
        mutationFn: (input: CreatePublicationInput) => publication ? updatePublicationAction(publication.id, input) : createPublicationAction(input),
        onSuccess: () => { toast.success(publication ? "Publicação atualizada com sucesso!" : "Publicação criada com sucesso!"); router.push("/admin/publications"); router.refresh(); },
        onError: (error) => toast.error(error.message || "Não foi possível salvar a publicação."),
    });
    function toInput(value: PublicationFormValues): CreatePublicationInput {
        const common = { title: value.title, summary: value.summary || undefined, content: value.content, thumbnailUrl: value.thumbnailUrl || undefined, status: value.status, media: value.media.map((m) => ({ ...(m.id && { id: BigInt(m.id) }), type: m.type, url: m.url, thumbnailUrl: m.thumbnailUrl || undefined, alt: m.alt || undefined, caption: m.caption || undefined })) };
        if (value.type === "event") return { ...common, type: "event", startAt: new Date(value.startAt).toISOString(), endAt: new Date(value.endAt).toISOString(), addressId: BigInt(value.addressId), maxParticipants: value.maxParticipants ? Number(value.maxParticipants) : null, requiresConfirmation: value.requiresConfirmation };
        if (value.type === "notice") return { ...common, type: "notice", expiresAt: value.expiresAt ? new Date(value.expiresAt).toISOString() : null, noticePriority: value.noticePriority };
        return { ...common, type: "service", serviceCategory: value.serviceCategory };
    }
    const error = (name: keyof PublicationFormValues) => form.formState.errors[name]?.message;
    return <form onSubmit={form.handleSubmit((value) => mutation.mutate(toInput(value)), (errors: FieldErrors<PublicationFormValues>) => { const first = Object.values(errors)[0]; toast.error(typeof first?.message === "string" ? first.message : "Revise os campos destacados."); })} noValidate className="flex w-full flex-col gap-6">
        <section className="grid grid-cols-1 gap-4 rounded-2xl border border-j-gray-200 bg-j-white p-5 shadow-sm md:grid-cols-2 md:p-6">
            <Select label="Tipo" required labelClassName={label} className={field} error={error("type")} {...form.register("type")}><option value="event">Evento</option><option value="notice">Aviso</option><option value="service">Serviço</option></Select>
            <Select label="Status" required labelClassName={label} className={field} error={error("status")} {...form.register("status")}><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="archived">Arquivado</option></Select>
            <div className="md:col-span-2"><Input label="Título" required labelClassName={label} className={field} error={error("title")} {...form.register("title")} /></div>
            <div className="md:col-span-2"><Input label="Resumo" maxLength={300} labelClassName={label} className={field} error={error("summary")} {...form.register("summary")} /></div>
            <div className="md:col-span-2"><Textarea label="Conteúdo" required rows={7} labelClassName={label} className={field} error={error("content")} {...form.register("content")} /></div>
            <div className="md:col-span-2"><Input label="URL da miniatura" type="url" labelClassName={label} className={field} error={error("thumbnailUrl")} {...form.register("thumbnailUrl")} /></div>
            {type === "event" && <><Input label="Início" type="datetime-local" required labelClassName={label} className={field} error={error("startAt")} {...form.register("startAt")} /><Input label="Término" type="datetime-local" required labelClassName={label} className={field} error={error("endAt")} {...form.register("endAt")} /><Input label="ID do endereço" inputMode="numeric" required labelClassName={label} className={field} error={error("addressId")} {...form.register("addressId")} /><Input label="Limite de participantes" type="number" min="1" labelClassName={label} className={field} error={error("maxParticipants")} {...form.register("maxParticipants")} /><label className="flex items-center gap-2 text-sm font-bold text-j-gray-700 md:col-span-2"><input type="checkbox" className="h-4 w-4 accent-j-blue-800" {...form.register("requiresConfirmation")} /> Exige confirmação de participação</label></>}
            {type === "notice" && <><Input label="Expiração" type="datetime-local" labelClassName={label} className={field} error={error("expiresAt")} {...form.register("expiresAt")} /><Select label="Prioridade" labelClassName={label} className={field} error={error("noticePriority")} {...form.register("noticePriority")}><option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option></Select></>}
            {type === "service" && <Select label="Categoria" labelClassName={label} className={field} error={error("serviceCategory")} {...form.register("serviceCategory")}><option value="benefit">Benefício</option><option value="help">Ajuda</option><option value="general">Geral</option></Select>}
        </section>
        <section className="rounded-2xl border border-j-gray-200 bg-j-white p-5 shadow-sm md:p-6"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-black text-j-blue-800">Mídias por URL</h2><p className="text-sm text-j-gray-500">Adicione imagens ou vídeos relacionados.</p></div><Button type="button" onClick={() => append({ type: "image", url: "", thumbnailUrl: "", alt: "", caption: "" })}><Plus size={16} /> Adicionar mídia</Button></div>
            <div className="flex flex-col gap-4">{fields.length === 0 && <p className="rounded-xl border border-dashed border-j-gray-300 p-5 text-center text-sm text-j-gray-500">Nenhuma mídia adicionada.</p>}{fields.map((media, index) => <div key={media.id} className="relative grid grid-cols-1 gap-3 rounded-xl bg-j-gray-100 p-4 md:grid-cols-2"><ButtonIcon type="button" onClick={() => remove(index)} aria-label={`Remover mídia ${index + 1}`} className="absolute right-2 top-2 p-2 text-j-red-500"><Trash2 size={16} /></ButtonIcon><Select label="Tipo" labelClassName={label} className={field} {...form.register(`media.${index}.type`)}><option value="image">Imagem</option><option value="video">Vídeo</option></Select><div className="pr-10"><Input label="URL" type="url" required labelClassName={label} className={field} error={form.formState.errors.media?.[index]?.url?.message} {...form.register(`media.${index}.url`)} /></div><Input label="URL da miniatura" type="url" labelClassName={label} className={field} error={form.formState.errors.media?.[index]?.thumbnailUrl?.message} {...form.register(`media.${index}.thumbnailUrl`)} /><Input label="Texto alternativo" labelClassName={label} className={field} {...form.register(`media.${index}.alt`)} /><div className="md:col-span-2"><Input label="Legenda" labelClassName={label} className={field} {...form.register(`media.${index}.caption`)} /></div></div>)}</div>
        </section>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button type="button" onClick={() => router.back()} disabled={mutation.isPending} className="border-2 border-j-gray-200 bg-j-white text-j-gray-700 hover:bg-j-gray-100"><ArrowLeft size={16} /> Cancelar</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? <><LoaderCircle size={16} className="animate-spin" /> Salvando...</> : <><Save size={16} /> Salvar publicação</>}</Button></div>
    </form>;
}
