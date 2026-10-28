import type { PaymentMethod, PaymentStatus } from "@/schemas/payments";

export const statusLabels: Record<PaymentStatus, string> = {
    PENDING_VALIDATION: "Pendente de análise",
    CONFIRMED: "Confirmado",
    REJECTED: "Rejeitado",
    CANCELED: "Cancelado",
};

export const methodLabels: Record<PaymentMethod, string> = {
    PIX: "Pix", CASH: "Dinheiro", BANK_TRANSFER: "Transferência bancária",
    CREDIT_CARD: "Cartão de crédito", DEBIT_CARD: "Cartão de débito", OTHER: "Outro",
};

const statusColors: Record<PaymentStatus, string> = {
    PENDING_VALIDATION: "bg-amber-100 text-amber-900",
    CONFIRMED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    CANCELED: "bg-j-gray-100 text-j-gray-600",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
    return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusColors[status]}`}>{statusLabels[status]}</span>;
}

export const formatAmount = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
export const formatDate = (value: string | null) => value
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(value))
    : "—";

export const paymentKeys = {
    lists: ["billing", "payments", "list"] as const,
    detail: (id: number) => ["billing", "payments", "detail", id] as const,
};
