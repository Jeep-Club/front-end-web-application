"use client";
import { useQuery } from "@tanstack/react-query";
import { getChargeDefinitionAction } from "@/actions/billing/chargeDefinitions/get";
import { useModal } from "@/providers/ModalProvider";
import { X } from "lucide-react";
import { displayBillingValue } from "./billingDisplay";

export function ChargeDefinitionDetailsModal({ id }: { id: number }) {
    const { setClose } = useModal();
    const { data, error, isLoading } = useQuery({ queryKey: ["billing", "charge-definitions", id], queryFn: () => getChargeDefinitionAction(id) });
    const fields: Record<string, string> = { name: "Nome", description: "Descrição", defaultAmount: "Valor padrão", recurrenceType: "Recorrência", required: "Obrigatória", paymentAcceptancePolicy: "Política de pagamento", latePaymentGraceDays: "Tolerância (dias)", status: "Situação", createdAt: "Criada em", updatedAt: "Atualizada em", archivedAt: "Arquivada em" };
    return <section role="dialog" aria-modal="true" aria-label="Detalhamento da cobrança" className="max-h-[90dvh] w-full max-w-xl overflow-auto rounded-l-3xl bg-j-white p-6"><header className="flex items-start justify-between gap-4"><h2 className="text-xl font-bold text-j-blue-800">Detalhamento da cobrança</h2><button type="button" aria-label="Fechar visualização" onClick={setClose} className="shrink-0 rounded-full bg-j-gray-100 p-2 text-j-gray-600 transition-colors hover:bg-j-gray-200 hover:text-j-blue-800"><X size={20} /></button></header>{isLoading && <p className="py-5">Carregando...</p>}{error && <p role="alert" className="py-5 text-red-600">{error.message}</p>}{data && <dl className="my-5 grid gap-3 sm:grid-cols-2">{Object.entries(data).filter(([key]) => fields[key]).map(([key, value]) => <div key={key} className="rounded-xl bg-j-gray-100 p-3"><dt className="text-xs text-j-gray-600">{fields[key]}</dt><dd className="break-words text-sm font-semibold">{key === "status" ? ({ ACTIVE: "Ativa", INACTIVE: "Inativa", ARCHIVED: "Arquivada" } as Record<string, string>)[String(value)] : displayBillingValue(key, value)}</dd></div>)}</dl>}</section>;
}
