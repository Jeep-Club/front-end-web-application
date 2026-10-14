export const billingLabels: Record<string, string> = {
    GENERATED: "Gerado", CANCELED: "Cancelado", FINISHED: "Finalizado", ARCHIVED: "Arquivado",
    PENDING: "Pendente", OVERDUE: "Em atraso", EXPIRED: "Expirado", PAID: "Pago",
    PENDING_VALIDATION: "Aguardando validação", CONFIRMED: "Confirmado", REJECTED: "Rejeitado",
    ELIGIBLE: "Elegível", REQUESTED: "Solicitado", APPROVED: "Aprovado", REFUNDED: "Reembolsado",
    PIX: "Pix", CASH: "Dinheiro", BANK_TRANSFER: "Transferência bancária", CREDIT_CARD: "Cartão de crédito", DEBIT_CARD: "Cartão de débito", OTHER: "Outro",
    UNTIL_DUE_DATE: "Até o vencimento", AFTER_DUE_DATE: "Após o vencimento, sem limite", UNTIL_DAYS_AFTER_DUE_DATE: "Com tolerância após o vencimento",
    ONE_TIME: "Cobrança única", MONTHLY: "Mensal", YEARLY: "Anual", CYCLE_CANCELED_BY_ADMIN: "Cancelamento do ciclo", MEMBER_REQUEST: "Solicitação do associado", MANUAL_ADJUSTMENT: "Ajuste manual",
    ACTIVE: "Ativa", INACTIVE: "Inativa", ALL_MEMBERS: "Todos os associados", USER: "Usuário específico", ROLE: "Cargo", EVENT_PARTICIPANTS: "Participantes do evento",
};
export const fieldLabels: Record<string, string> = {
    id: "Código do registro", userId: "Código do associado", chargeDefinitionId: "Código da definição", chargeCycleId: "Código do ciclo", memberChargeId: "Código da cobrança", memberPaymentId: "Código do pagamento",
    code: "Referência", dueDate: "Vencimento", status: "Situação", effectiveStatus: "Situação atual", amount: "Valor", originalAmount: "Valor original", finalAmount: "Valor final",
    paymentMethod: "Forma de pagamento", paymentAcceptancePolicy: "Política de pagamento", paymentAllowedUntil: "Pagamento permitido até", latePaymentGraceDays: "Tolerância (dias)",
    reason: "Motivo", rejectionReason: "Motivo da rejeição", notes: "Observações", eligibleUntil: "Elegível até", eligibleAt: "Elegibilidade criada em", requestedAt: "Solicitado em",
    createdAt: "Criado em", updatedAt: "Atualizado em", paidAt: "Pago em", confirmedAt: "Confirmado em", rejectedAt: "Rejeitado em", canceledAt: "Cancelado em", generatedAt: "Gerado em", finishedAt: "Finalizado em", archivedAt: "Arquivado em", approvedAt: "Aprovado em", refundedAt: "Reembolsado em",
    chargeDefinitionNameSnapshot: "Nome na geração", chargeDefinitionDescriptionSnapshot: "Descrição na geração", chargeDefinitionDefaultAmountSnapshot: "Valor na geração", chargeDefinitionRecurrenceTypeSnapshot: "Recorrência na geração", chargeDefinitionRequiredSnapshot: "Obrigatória na geração", chargeDefinitionPaymentAcceptancePolicySnapshot: "Política na geração", chargeDefinitionLatePaymentGraceDaysSnapshot: "Tolerância na geração (dias)",
    generatedByUserId: "Gerado por (usuário)", canceledByUserId: "Cancelado por (usuário)", finishedByUserId: "Finalizado por (usuário)", archivedByUserId: "Arquivado por (usuário)", confirmedByUserId: "Confirmado por (usuário)", rejectedByUserId: "Rejeitado por (usuário)", createdByUserId: "Criado por (usuário)", requestedByUserId: "Solicitado por (usuário)", approvedByUserId: "Aprovado por (usuário)", refundedByUserId: "Reembolsado por (usuário)",
};
export function displayBillingValue(key: string, value: unknown): string {
    if (value == null || value === "") return "—";
    if (typeof value === "boolean") return value ? "Sim" : "Não";
    if (/amount/i.test(key)) return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        if (value.length === 10) return value.split("-").reverse().join("/");
        return new Date(value).toLocaleString("pt-BR");
    }
    if (/status|recurrence|paymentMethod|paymentAcceptancePolicy|reason|audienceType/i.test(key)) {
        return billingLabels[String(value)] ?? String(value);
    }
    return String(value);
}
export async function saveBillingFile(file: { base64: string; contentType: string; filename: string }) {
    const bytes = Uint8Array.from(atob(file.base64), (character) => character.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: file.contentType }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = file.filename;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
