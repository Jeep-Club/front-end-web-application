"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { confirmPaymentAction, getPaymentAction, rejectPaymentAction } from "@/server/actions/payments";
import { Button } from "@/components/common/button";
import { paymentPermissions } from "@/config/paymentPermissions";
import { rejectPaymentSchema } from "@/schemas/payments";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import PaymentReceipt from "./PaymentReceipt";
import { formatAmount, formatDate, methodLabels, paymentKeys, PaymentStatusBadge } from "./presentation";

export default function PaymentDetailPage({ id }: { id: number }) {
    const queryClient = useQueryClient();
    const permissions = useUserStore(state => state.permissions);
    const canRead = hasPermission(permissions, paymentPermissions.module, paymentPermissions.read);
    const canConfirm = hasPermission(permissions, paymentPermissions.module, paymentPermissions.confirm);
    const canReject = hasPermission(permissions, paymentPermissions.module, paymentPermissions.reject);
    const [decision, setDecision] = useState<"confirm" | "reject" | null>(null);
    const [reason, setReason] = useState("");
    const { data: payment, error, isPending, isFetching, refetch } = useQuery({
        queryKey: paymentKeys.detail(id),
        queryFn: () => getPaymentAction(id),
        enabled: canRead,
    });
    const mutation = useMutation({
        mutationFn: (action: "confirm" | "reject") => action === "confirm" ? confirmPaymentAction(id) : rejectPaymentAction(id, reason),
        onSuccess: async updated => {
            // Cancela consultas antigas antes de gravar a resposta da decisão no cache.
            await queryClient.cancelQueries({ queryKey: paymentKeys.detail(id) });
            queryClient.setQueryData(paymentKeys.detail(id), updated);
            setDecision(null);
            setReason("");
            toast.success(updated.status === "CONFIRMED" ? "Pagamento confirmado." : "Pagamento rejeitado.");
            await queryClient.invalidateQueries({ queryKey: paymentKeys.lists });
        },
        onError: async () => {
            // Outro administrador pode ter decidido enquanto esta tela estava aberta.
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: paymentKeys.detail(id) }),
                queryClient.invalidateQueries({ queryKey: paymentKeys.lists }),
            ]);
        },
    });
    const isReviewable = payment?.status === "PENDING_VALIDATION";
    const reasonResult = rejectPaymentSchema.safeParse({ rejectionReason: reason });
    const canSubmit = canRead && isReviewable && !mutation.isPending && !isFetching
        && (decision === "confirm" ? canConfirm : decision === "reject" && canReject && reasonResult.success);

    if (!canRead) return <p className="p-6 text-j-gray-600">Acesso ao pagamento indisponível.</p>;

    return <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-8">
        <Link href="/admin/pagamentos" className="flex items-center gap-2 text-sm font-bold text-j-blue-800"><ArrowLeft size={16} /> Voltar aos pagamentos</Link>
        <header className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-black text-j-blue-800">Pagamento #{id}</h1>{payment && <PaymentStatusBadge status={payment.status} />}</header>
        {isPending && <p role="status">Carregando pagamento...</p>}
        {error && <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl bg-j-white p-6 text-red-700"><p>{error.message}</p><Button disabled={isFetching} onClick={() => { void refetch(); }}>Tentar novamente</Button></div>}
        {payment && !error && <>
            <section className="rounded-2xl border border-j-gray-200 bg-j-white p-4 md:p-6">
                <h2 className="mb-4 text-lg font-black text-j-blue-800">Dados do pagamento</h2>
                <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                    {[
                        ["Cobrança", `#${payment.memberChargeId}`], ["Valor informado", formatAmount(payment.amount)],
                        ["Método", methodLabels[payment.paymentMethod]], ["Pago em", formatDate(payment.paidAt)],
                        ["Enviado em", formatDate(payment.createdAt)], ["Atualizado em", formatDate(payment.updatedAt)],
                        ["Confirmado em", formatDate(payment.confirmedAt)], ["Confirmado por", payment.confirmedByUserId ? `Usuário #${payment.confirmedByUserId}` : "—"],
                        ["Rejeitado em", formatDate(payment.rejectedAt)], ["Rejeitado por", payment.rejectedByUserId ? `Usuário #${payment.rejectedByUserId}` : "—"],
                        ["Cancelado em", formatDate(payment.canceledAt)],
                    ].map(([label, value]) => <div key={label}><dt className="text-j-gray-500">{label}</dt><dd className="mt-1 font-bold text-j-blue-800">{value}</dd></div>)}
                    <div className="sm:col-span-2"><dt className="text-j-gray-500">Observações</dt><dd className="mt-1 whitespace-pre-wrap break-words text-j-gray-700">{payment.notes || "Sem observações."}</dd></div>
                    {payment.rejectionReason && <div className="sm:col-span-2"><dt className="text-j-gray-500">Motivo da rejeição</dt><dd className="mt-1 whitespace-pre-wrap break-words text-red-700">{payment.rejectionReason}</dd></div>}
                </dl>
            </section>
            <PaymentReceipt key={`${id}-${payment.updatedAt}`} id={id} />
            <section aria-label="Decisão sobre o pagamento" className="rounded-2xl border border-j-gray-200 bg-j-white p-4 md:p-6">
                <h2 className="mb-3 text-lg font-black text-j-blue-800">Análise</h2>
                {mutation.error && <p role="alert" className="mb-4 text-sm text-red-700">{mutation.error.message}</p>}
                {!isReviewable ? <p role="status" className="text-sm text-j-gray-600">Este pagamento já foi analisado ou cancelado.</p>
                    : !canConfirm && !canReject ? <p className="text-sm text-j-gray-600">Você possui acesso somente à consulta deste pagamento.</p>
                        : decision ? <form onSubmit={event => { event.preventDefault(); if (canSubmit && decision) mutation.mutate(decision); }} className="flex flex-col gap-4">
                            <p className="text-sm text-j-gray-700">{decision === "confirm" ? `Confirmar o pagamento de ${formatAmount(payment.amount)} da cobrança #${payment.memberChargeId}?` : "Informe por que o comprovante foi rejeitado."}</p>
                            {decision === "reject" && <label className="flex flex-col gap-2 text-sm font-bold text-j-blue-800">
                                Motivo da rejeição
                                <textarea autoFocus required maxLength={500} rows={4} value={reason} onChange={event => setReason(event.target.value)} disabled={mutation.isPending} aria-describedby="reason-help" className="rounded-lg border border-j-gray-200 p-3 font-normal" />
                                <span id="reason-help" className="text-xs font-normal text-j-gray-600">{reason.length}/500 caracteres. O motivo é obrigatório.</span>
                            </label>}
                            <div className="flex flex-wrap gap-3">
                                <Button type="submit" disabled={!canSubmit} className={decision === "reject" ? "bg-red-700 text-white hover:bg-red-800 hover:text-white" : "bg-j-blue-700 text-j-white hover:bg-j-blue-800 hover:text-j-white"}>{mutation.isPending ? "Salvando decisão..." : decision === "confirm" ? "Confirmar pagamento" : "Rejeitar pagamento"}</Button>
                                <Button disabled={mutation.isPending} onClick={() => { setDecision(null); mutation.reset(); }} className="bg-j-gray-100 text-j-blue-800">Cancelar</Button>
                            </div>
                        </form> : <div className="flex flex-wrap gap-3">
                            {canConfirm && <Button disabled={isFetching || mutation.isPending} onClick={() => { mutation.reset(); setDecision("confirm"); }}><Check size={18} /> Confirmar</Button>}
                            {canReject && <Button disabled={isFetching || mutation.isPending} onClick={() => { mutation.reset(); setDecision("reject"); }} className="bg-red-700 text-white hover:bg-red-800 hover:text-white"><X size={18} /> Rejeitar</Button>}
                        </div>}
            </section>
        </>}
    </div>;
}
