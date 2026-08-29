type ChargeRecurrenceType = "ONE_TIME" | "MONTHLY" | "YEARLY";

type PaymentAcceptancePolicy =
    | "UNTIL_DUE_DATE"
    | "AFTER_DUE_DATE"
    | "UNTIL_DAYS_AFTER_DUE_DATE";

type ChargeDefinitionStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

/**
 * Espelha com.jeepclub.backend.billing.api.http.dto.definition.ChargeDefinitionSummaryResponse.
 */
interface ChargeDefinitionSummary {
    id: number;
    name: string;
    defaultAmount: number;
    recurrenceType: ChargeRecurrenceType;
    required: boolean;
    paymentAcceptancePolicy: PaymentAcceptancePolicy;
    latePaymentGraceDays: number | null;
    status: ChargeDefinitionStatus;
}

/**
 * Espelha com.jeepclub.backend.billing.api.http.dto.definition.ChargeDefinitionResponse.
 */
interface ChargeDefinition extends ChargeDefinitionSummary {
    description: string | null;
    createdAt: string;
    updatedAt: string | null;
    archivedAt: string | null;
}

/**
 * Espelha com.jeepclub.backend.billing.api.http.dto.definition.ChargeDefinitionRequest
 * e ChargeDefinitionUpdateRequest (campos identicos nas duas).
 */
interface ChargeDefinitionRequest {
    name: string;
    description?: string;
    defaultAmount: number;
    recurrenceType: ChargeRecurrenceType;
    required: boolean;
    paymentAcceptancePolicy: PaymentAcceptancePolicy;
    latePaymentGraceDays?: number;
}

type ChargeDefinitionFormData = ChargeDefinitionRequest;

interface ChargeDefinitionSearchParams {
    page?: string;
    size?: string;
    sort?: string;
}
