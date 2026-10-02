type MemberChargeStatus = "PENDING" | "PAID" | "CANCELED";

type MemberChargeEffectiveStatus =
    | "PENDING"
    | "OVERDUE"
    | "EXPIRED"
    | "PAID"
    | "CANCELED";

interface MemberChargeSummary {
    id: number;
    userId: number;
    chargeDefinitionId: number;
    chargeCycleId: number;
    finalAmount: number;
    dueDate: string;
    paymentAcceptancePolicy: PaymentAcceptancePolicy;
    paymentAllowedUntil: string | null;
    status: MemberChargeStatus;
    effectiveStatus: MemberChargeEffectiveStatus;
}

interface MemberChargeSearchParams {
    status?: MemberChargeStatus;
    page?: string;
    size?: string;
    sort?: string;
}
