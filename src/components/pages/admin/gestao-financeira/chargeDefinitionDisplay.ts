export const CHARGE_RECURRENCE_LABEL: Record<ChargeRecurrenceType, string> = {
    ONE_TIME: "Cobrança única",
    MONTHLY: "Mensal",
    YEARLY: "Anual",
};

export const PAYMENT_ACCEPTANCE_POLICY_LABEL: Record<PaymentAcceptancePolicy, string> = {
    UNTIL_DUE_DATE: "Até o vencimento",
    AFTER_DUE_DATE: "Sem limite após o vencimento",
    UNTIL_DAYS_AFTER_DUE_DATE: "Até X dias após o vencimento",
};

export const CHARGE_DEFINITION_STATUS_LABEL: Record<ChargeDefinitionStatus, string> = {
    ACTIVE: "Ativa",
    INACTIVE: "Inativa",
    ARCHIVED: "Arquivada",
};

export const CHARGE_DEFINITION_STATUS_STYLE: Record<ChargeDefinitionStatus, string> = {
    ACTIVE: "bg-j-green-100 text-j-green-700",
    INACTIVE: "bg-j-gray-200 text-j-gray-600",
    ARCHIVED: "bg-j-gray-200 text-j-gray-500",
};

export function formatCurrencyBRL(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}
