import { z } from "zod";

export const PAYMENT_METHOD_LABELS = {
    PIX: "Pix", CASH: "Dinheiro", BANK_TRANSFER: "Transferência bancária",
    CREDIT_CARD: "Cartão de crédito", DEBIT_CARD: "Cartão de débito", OTHER: "Outro",
} as const;

export const PAYMENT_RECEIPT_MAX_BYTES = 10 * 1024 * 1024;
export const PAYMENT_RECEIPT_ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp";

export const paymentReceiptFileSchema = z.custom<File>((value) => typeof File !== "undefined" && value instanceof File, "Selecione um comprovante.")
    .superRefine((file, context) => {
        if (!(file instanceof File)) return;
        if (!file.size) context.addIssue({ code: "custom", message: "O comprovante está vazio." });
        if (file.size > PAYMENT_RECEIPT_MAX_BYTES) context.addIssue({ code: "custom", message: "O comprovante deve ter no máximo 10 MiB." });
        if (!["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(file.type) || !/\.(pdf|jpe?g|png|webp)$/i.test(file.name)) {
            context.addIssue({ code: "custom", message: "Envie um comprovante em PDF, JPEG, PNG ou WebP." });
        }
    });

export const paymentReceiptSubmissionSchema = z.object({
    amount: z.coerce.number().finite().min(0.01, "Informe um valor de pagamento válido.").multipleOf(0.01, "O valor deve ter no máximo duas casas decimais."),
    paymentMethod: z.enum(["PIX", "CASH", "BANK_TRANSFER", "CREDIT_CARD", "DEBIT_CARD", "OTHER"]),
    paidAt: z.string().datetime({ offset: true, message: "Informe a data e a hora do pagamento." }),
    receiptFile: paymentReceiptFileSchema,
    notes: z.string().trim().max(500, "As observações devem ter no máximo 500 caracteres."),
});
