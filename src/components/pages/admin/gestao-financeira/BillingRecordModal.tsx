"use client";
import { Button } from "@/components/common/button";
import { ConfirmButton } from "@/components/common/button/ConfirmButton";
import { useModal } from "@/providers/ModalProvider";
import type { BillingResource } from "@/schemas/billing/management";
import { getBillingAction,mutateBillingAction } from "@/server/actions/billing/management";
import { useMutation,useQuery,useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { displayBillingValue,fieldLabels } from "./billingDisplay";

export function BillingRecordModal({ resource, id, operation, title, explanation }: { resource: BillingResource; id: number; operation?: string; title: string; explanation?: string }) {
    const { setClose } = useModal();
    const client = useQueryClient();
    const [value, setValue] = useState("");
    const [failure, setFailure] = useState<string>();
    const details = useQuery({ queryKey: ["billing", resource, id], queryFn: () => getBillingAction(resource, id) });
    const mutation = useMutation({
        mutationFn: () => mutateBillingAction(resource, id, operation!, value),
        onSuccess: () => { client.invalidateQueries({ queryKey: ["billing"] }); toast.success("Operação concluída."); setClose(); },
        onError: (error) => setFailure(error.message),
    });
    const isAmount = operation === "final-amount";
    const isRejection = operation === "reject";
    const originalAmount = details.data && "originalAmount" in details.data ? details.data.originalAmount : undefined;
    const valid = !isAmount && !isRejection || (isRejection ? value.trim().length > 0 && value.trim().length <= 500 : Number(value) >= 0.01 && (originalAmount == null || Number(value) <= originalAmount));
    return <section role="dialog" aria-modal="true" aria-label={title} className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-y-auto rounded-3xl bg-j-white p-6 shadow-xl">
        <header className="flex items-start justify-between gap-4"><h2 className="text-xl font-extrabold text-j-blue-800">{title} #{id}</h2><button type="button" aria-label="Fechar" disabled={mutation.isPending} onClick={setClose} className="shrink-0 rounded-full bg-j-gray-100 p-2 text-j-gray-600 transition-colors hover:bg-j-gray-200 hover:text-j-blue-800"><X size={20} /></button></header>
        {explanation && <p className="mt-4 text-sm text-j-gray-600">{explanation}</p>}
        {details.isLoading && <p className="py-6" role="status">Carregando detalhes...</p>}
        {details.error && <p role="alert" className="my-4 text-red-600">{details.error.message}</p>}
        {details.data && <dl className="my-5 grid grid-cols-1 gap-3 sm:grid-cols-2">{Object.entries(details.data).filter(([key, value]) => key !== "receiptUrl" && value != null && fieldLabels[key]).map(([key, value]) => <div key={key} className="rounded-xl bg-j-gray-100 p-3"><dt className="text-xs text-j-gray-600">{fieldLabels[key]}</dt><dd className="mt-1 break-words text-sm font-semibold text-j-blue-800">{(details.data as Record<string, unknown>)[`${key}Label`] as string || displayBillingValue(key, value)}</dd></div>)}</dl>}
        <form onSubmit={(event) => { event.preventDefault(); setFailure(undefined); if (valid) mutation.mutate(); }} className="flex flex-col gap-4">
            {isRejection && <label className="text-sm font-semibold">Motivo da rejeição<textarea required maxLength={500} value={value} onChange={(event) => setValue(event.target.value)} className="mt-2 w-full rounded-xl border border-j-gray-300 p-3" rows={3} /></label>}
            {isAmount && <label className="text-sm font-semibold">Novo valor final (R$)<input required type="number" min="0.01" step="0.01" max={originalAmount} value={value} onChange={(event) => setValue(event.target.value)} className="mt-2 w-full rounded-xl border border-j-gray-300 p-3" /><span className="mt-1 block text-xs font-normal">O valor não pode superar o original. Pagamentos em validação impedem o ajuste.</span></label>}
            {failure && <p role="alert" className="text-sm text-red-600">{failure}</p>}
            {operation && <footer className="flex justify-end gap-3"><Button type="button" disabled={mutation.isPending} onClick={setClose}>{operation ? "Voltar" : "Fechar"}</Button>{operation && <ConfirmButton type="submit" disabled={!valid || mutation.isPending || !details.data}>{mutation.isPending ? "Processando..." : "Confirmar operação"}</ConfirmButton>}</footer>}
        </form>
    </section>;
}
