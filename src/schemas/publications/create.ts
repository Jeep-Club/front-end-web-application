import { z } from "zod";
import { publicationPlainText } from "@/utils/publications/content";

const text = z.string().trim().min(1, "Campo obrigatório.");
const publicationContent = text.refine((value) => publicationPlainText(value).length > 0, "Escreva o conteúdo da publicação.");
const imageSchema = z.object({ storageKey: text, position: z.number().int().min(0), primary: z.boolean() });
const images = z.array(imageSchema).min(1, "Envie pelo menos uma imagem.").max(5).superRefine((items, ctx) => {
    if (items.filter((image) => image.primary).length !== 1 || new Set(items.map((image) => image.storageKey)).size !== items.length || items.some((image, index) => image.position !== index)) {
        ctx.addIssue({ code: "custom", message: "A galeria deve ter uma capa, imagens únicas e posições sequenciais." });
    }
});
const common = { title: text.max(200), content: publicationContent, images };
export const createPublicationSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("NOTICE"), ...common }),
    z.object({ type: z.literal("EVENT"), ...common, startsAt: z.iso.datetime(), endsAt: z.iso.datetime().nullable() }),
    z.object({ type: z.literal("SERVICE"), ...common, amount: z.number().min(0.01).max(9999999999999.99).refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.01, "Use até duas casas decimais."), contactPhone: text.max(30) }),
]).superRefine((data, ctx) => {
    if (data.type !== "EVENT") return;
    if (Date.parse(data.startsAt) <= Date.now()) ctx.addIssue({ code: "custom", path: ["startsAt"], message: "O início deve estar no futuro." });
    if (data.endsAt && Date.parse(data.endsAt) <= Date.parse(data.startsAt)) ctx.addIssue({ code: "custom", path: ["endsAt"], message: "O término deve ser posterior ao início." });
});
export type CreatePublicationRequest = z.infer<typeof createPublicationSchema>;

const fileSchema = z.custom<File>((value) => typeof File !== "undefined" && value instanceof File, "Selecione uma imagem.").refine((file) => !!file && file.size > 0 && file.size <= 5 * 1024 * 1024, "A imagem deve ter até 5 MiB.").refine((file) => !!file && ["image/jpeg", "image/png", "image/webp"].includes(file.type), "Use JPEG, PNG ou WebP.");
export const publicationFormSchema = z.object({
    type: z.enum(["NOTICE", "EVENT", "SERVICE"]),
    title: text.max(200, "Use até 200 caracteres."),
    content: publicationContent,
    photos: z.array(fileSchema).min(1, "Envie pelo menos uma imagem.").max(5),
    primaryIndex: z.string(),
    startsAt: z.string(), endsAt: z.string(), amount: z.string(), contactPhone: z.string(),
}).superRefine((data, ctx) => {
    const primary = Number(data.primaryIndex);
    if (!Number.isInteger(primary) || primary < 0 || primary >= data.photos.length) ctx.addIssue({ code: "custom", path: ["primaryIndex"], message: "Selecione a imagem de capa." });
    if (data.type === "EVENT") {
        const start = Date.parse(data.startsAt);
        if (!Number.isFinite(start) || start <= Date.now()) ctx.addIssue({ code: "custom", path: ["startsAt"], message: "Informe um início no futuro." });
        if (data.endsAt && (!Number.isFinite(Date.parse(data.endsAt)) || Date.parse(data.endsAt) <= start)) ctx.addIssue({ code: "custom", path: ["endsAt"], message: "O término deve ser posterior ao início." });
    }
    if (data.type === "SERVICE") {
        if (!/^\d{1,13}([.,]\d{1,2})?$/.test(data.amount) || Number(data.amount.replace(",", ".")) < 0.01) ctx.addIssue({ code: "custom", path: ["amount"], message: "Informe um valor positivo com até duas casas decimais." });
        if (!data.contactPhone.trim() || data.contactPhone.trim().length > 30) ctx.addIssue({ code: "custom", path: ["contactPhone"], message: "Informe um telefone com até 30 caracteres." });
    }
});
export type PublicationFormData = z.infer<typeof publicationFormSchema>;