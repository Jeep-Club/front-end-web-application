import { z } from "zod";
import { publicationInstantSchema } from "./feed";
import { publicationPlainText } from "@/utils/publications/content";

const text = z.string().trim().min(1, "Campo obrigatório.");
const publicationContent = text.refine((value) => publicationPlainText(value).length > 0, "Escreva o conteúdo da publicação.");
const imageSchema = z.object({ storageKey: z.string().regex(/^images\/\d{4}\/\d{2}\/\d{2}\/[a-fA-F0-9-]{36}\.(png|jpg|webp)$/, 'Use a chave de uma imagem enviada.'), position: z.number().int().min(0), primary: z.boolean() });
export const publicationGallerySchema = z.array(imageSchema).min(1, "Envie pelo menos uma imagem.").max(5).superRefine((items, ctx) => {
    if (items.filter((image) => image.primary).length !== 1 || new Set(items.map((image) => image.storageKey)).size !== items.length || items.some((image, index) => image.position !== index)) {
        ctx.addIssue({ code: "custom", message: "A galeria deve ter uma capa, imagens únicas e posições sequenciais." });
    }
});
export const publicationEditorialFields = { title: text.max(200), content: publicationContent, images: publicationGallerySchema };
const common = publicationEditorialFields;
const chargeFlags = { requiredForParticipation: z.boolean().optional(), participationCutoff: publicationInstantSchema.optional(), financialDueDate: z.iso.date().nullable().optional() };
export const eventChargeSchema = z.union([
    z.object({ chargeDefinitionId: z.number().int().positive(), ...chargeFlags }).strict(),
    z.object({ name: text, amount: z.number().positive(), description: z.string().optional(), billingRequired: z.boolean().optional(), ...chargeFlags }).strict(),
]);
export const eventChargesSchema = z.array(eventChargeSchema).superRefine((items, ctx) => {
    const ids = items.flatMap(item => 'chargeDefinitionId' in item ? [item.chargeDefinitionId] : []);
    if (new Set(ids).size !== ids.length) ctx.addIssue({ code: 'custom', message: 'Não repita a mesma definição de cobrança.' });
});
export type EventCharge = z.infer<typeof eventChargeSchema>;
export const eventChargeFormRowSchema = z.object({
    mode: z.enum(['existing', 'inline']), chargeDefinitionId: z.string(), name: z.string(), description: z.string(), amount: z.string(), billingRequired: z.boolean(), requiredForParticipation: z.boolean(), participationCutoff: z.string(), financialDueDate: z.string(), paymentAcceptancePolicy: z.string(),
});
export type EventChargeFormRow = z.infer<typeof eventChargeFormRowSchema>;
export function parseEventChargeRows(rows: EventChargeFormRow[], startsAt: string): EventCharge[] {
    const charges = rows.map((row, index) => {
        if (row.mode === 'existing' && row.paymentAcceptancePolicy && row.paymentAcceptancePolicy !== 'AFTER_DUE_DATE' && (row.requiredForParticipation || !row.financialDueDate)) throw new Error(`Cobrança ${index + 1}: esta configuração exige política AFTER_DUE_DATE.`);
        if (row.participationCutoff && (Date.parse(row.participationCutoff) <= Date.now() || Date.parse(row.participationCutoff) > Date.parse(startsAt))) throw new Error(`Cobrança ${index + 1}: cutoff deve estar no futuro e até o início.`);
        const flags = { requiredForParticipation: row.requiredForParticipation, ...(row.participationCutoff ? { participationCutoff: row.participationCutoff } : {}), ...(row.financialDueDate ? { financialDueDate: row.financialDueDate } : {}) };
        return row.mode === 'existing' ? { chargeDefinitionId: Number(row.chargeDefinitionId), ...flags } : { name: row.name, description: row.description, amount: Number(row.amount.replace(',', '.')), billingRequired: row.billingRequired, ...flags };
    });
    return eventChargesSchema.parse(charges);
}
export const createPublicationSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("NOTICE"), ...common }),
    z.object({ type: z.literal("EVENT"), ...common, startsAt: publicationInstantSchema, endsAt: publicationInstantSchema.nullable(), charges: eventChargesSchema.optional() }),
    z.object({ type: z.literal("SERVICE"), ...common, amount: z.number().min(0.01).max(9999999999999.99).refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.01, "Use até duas casas decimais."), contactPhone: text.regex(/^\d{10,11}$/, "Informe um telefone com DDD.") }),
]).superRefine((data, ctx) => {
    if (data.type !== "EVENT") return;
    for (const [index, charge] of (data.charges ?? []).entries()) {
        if (charge.participationCutoff && (Date.parse(charge.participationCutoff) <= Date.now() || Date.parse(charge.participationCutoff) > Date.parse(data.startsAt))) ctx.addIssue({ code: 'custom', path: ['charges', index, 'participationCutoff'], message: 'Cutoff deve estar no futuro e até o início.' });
    }
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
    charges: z.array(eventChargeFormRowSchema).optional(),
    startsAt: z.string(), endsAt: z.string(), amount: z.string(), contactPhone: z.string(),
}).superRefine((data, ctx) => {
    const primary = Number(data.primaryIndex);
    if (!Number.isInteger(primary) || primary < 0 || primary >= data.photos.length) ctx.addIssue({ code: "custom", path: ["primaryIndex"], message: "Selecione a imagem de capa." });
    if (data.type === "EVENT") {
        try { parseEventChargeRows(data.charges ?? [], data.startsAt); } catch (error) { ctx.addIssue({ code: 'custom', path: ['charges'], message: error instanceof z.ZodError ? 'Confira os campos e as definições das cobranças.' : error instanceof Error ? error.message : 'Confira as cobranças.' }); }
        const start = Date.parse(data.startsAt);
        if (!Number.isFinite(start) || start <= Date.now()) ctx.addIssue({ code: "custom", path: ["startsAt"], message: "Informe um início no futuro." });
        if (data.endsAt && (!Number.isFinite(Date.parse(data.endsAt)) || Date.parse(data.endsAt) <= start)) ctx.addIssue({ code: "custom", path: ["endsAt"], message: "O término deve ser posterior ao início." });
    }
    if (data.type === "SERVICE") {
        if (!/^\d{1,13}([.,]\d{1,2})?$/.test(data.amount) || Number(data.amount.replace(",", ".")) < 0.01) ctx.addIssue({ code: "custom", path: ["amount"], message: "Informe um valor positivo com até duas casas decimais." });
        if (!/^\d{10,11}$/.test(data.contactPhone.replace(/\D/g, ""))) ctx.addIssue({ code: "custom", path: ["contactPhone"], message: "Informe o telefone usando apenas números, com até 30 dígitos." });
    }
});
export type PublicationFormData = z.infer<typeof publicationFormSchema>;
