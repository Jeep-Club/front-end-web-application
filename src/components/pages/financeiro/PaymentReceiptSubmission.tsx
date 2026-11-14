"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input/input";
import { Select } from "@/components/common/select";
import { Textarea } from "@/components/common/textarea/textarea";
import { PAYMENT_METHOD_LABELS, PAYMENT_RECEIPT_ACCEPT, paymentReceiptFileSchema, paymentReceiptSubmissionSchema } from "@/schemas/billing/paymentReceipt";
import { extractApiErrorMessage } from "@/utils/http/apiError";

type Props = {
    charge: Pick<MemberChargeSummary, "id" | "finalAmount" | "effectiveStatus">;
    submitAction: (chargeId: number, form: FormData) => Promise<{ id: number; status: string }>;
};

export function PaymentReceiptSubmission({ charge, submitAction }: Props) {
    const id = useId();
    const [open, setOpen] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");
    const [fileError, setFileError] = useState("");
    const [paidAt, setPaidAt] = useState("");
    const [method, setMethod] = useState("PIX");
    const trigger = useRef<HTMLButtonElement>(null);
    const router = useRouter();
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: (form: FormData) => submitAction(charge.id, form),
        onSuccess: () => {
            setSent(true);
            setOpen(false);
            void queryClient.invalidateQueries({ queryKey: ["billing", "payments"] });
            router.refresh();
        },
    });
    const unavailable = charge.effectiveStatus === "CANCELED" ? "Cobrança cancelada não aceita comprovante."
        : charge.effectiveStatus === "PAID" ? "Esta cobrança já está paga."
            : charge.effectiveStatus === "EXPIRED" ? "O prazo de envio expirou. Procure a gestão para regularizar esta cobrança." : "";

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (mutation.isPending || unavailable || sent) return;
        setError("");
        const form = new FormData(event.currentTarget);
        const date = new Date(paidAt);
        form.set("amount", String(charge.finalAmount));
        form.set("paymentMethod", method);
        form.set("paidAt", Number.isNaN(date.getTime()) ? "" : date.toISOString());
        const parsed = paymentReceiptSubmissionSchema.safeParse(Object.fromEntries(form));
        if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
        mutation.mutate(form);
    }

    if (sent && charge.effectiveStatus !== "PAID" && charge.effectiveStatus !== "CANCELED") return <p role="status" className="text-sm font-semibold text-primary sm:col-span-2">Comprovante enviado. Aguardando validação da gestão. O envio não libera o acesso antes da confirmação do pagamento.</p>;

    return <div className="min-w-0 sm:col-span-2">
        <Button ref={trigger} type="button" disabled={Boolean(unavailable) || mutation.isPending} aria-expanded={open} aria-controls={`${id}-form`} aria-describedby={unavailable ? `${id}-unavailable` : undefined} onClick={() => {
            if (!open) {
                const now = new Date();
                setPaidAt(new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16));
            }
            setOpen(!open);
            setError("");
            setFileError("");
            mutation.reset();
        }} className="min-h-10 w-full px-4 text-sm sm:w-auto"><Upload size={16} aria-hidden="true" />{open ? "Fechar envio" : "Enviar comprovante"}</Button>
        {unavailable && <p id={`${id}-unavailable`} className="mt-2 text-xs text-secondary">{unavailable}</p>}
        {open && <form id={`${id}-form`} onSubmit={submit} aria-label={`Enviar comprovante da cobrança ${charge.id}`} aria-busy={mutation.isPending} className="mt-4 flex min-w-0 flex-col gap-4 rounded-xl border border-input-border bg-background-secondary p-4">
            <p className="text-sm text-secondary">Envie o comprovante para análise da gestão. O valor deve corresponder ao total da cobrança.</p>
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                <Input label="Valor do pagamento (R$)" name="displayAmount" value={charge.finalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} readOnly />
                <Select.Unregister label="Forma de pagamento" name="paymentMethod" value={method} onChange={event => setMethod(event.target.value)} required disabled={mutation.isPending}>
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </Select.Unregister>
            </div>
            <Input label="Data e hora do pagamento" name="paidAt" type="datetime-local" value={paidAt} onChange={event => setPaidAt(event.target.value)} required disabled={mutation.isPending} />
            <Input label="Comprovante" name="receiptFile" type="file" accept={PAYMENT_RECEIPT_ACCEPT} required disabled={mutation.isPending} aria-describedby={`${id}-file-help`} error={fileError} onChange={event => {
                const file = event.target.files?.[0];
                const parsed = paymentReceiptFileSchema.safeParse(file);
                setFileError(parsed.success ? "" : parsed.error.issues[0].message);
            }} className="file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-background-secondary file:px-3 file:py-1 file:text-primary" />
            <p id={`${id}-file-help`} className="-mt-2 text-xs text-secondary">PDF, JPEG, PNG ou WebP, até 10 MiB.</p>
            <Textarea label="Observações (opcional)" name="notes" maxLength={500} rows={3} disabled={mutation.isPending} />
            {(error || mutation.isError) && <p role="alert" className="text-sm text-input-error-text">{error || extractApiErrorMessage(mutation.error)}</p>}
            <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={mutation.isPending || Boolean(fileError)} isLoading={mutation.isPending} className="min-h-10 px-4 text-sm">{mutation.isPending ? "Enviando…" : "Enviar para análise"}</Button>
                <Button type="button" disabled={mutation.isPending} onClick={() => { setOpen(false); trigger.current?.focus(); }} className="min-h-10 border border-input-border bg-background px-4 text-sm text-primary hover:bg-input-bg-focus">Cancelar</Button>
            </div>
        </form>}
    </div>;
}
