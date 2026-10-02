type ChargeAudienceType = "ALL_MEMBERS" | "USER" | "ROLE" | "EVENT_PARTICIPANTS";

/**
 * Espelha com.jeepclub.backend.billing.api.http.dto.assignment.ChargeAssignmentResponse.
 */
interface ChargeAssignment {
    id: number;
    chargeDefinitionId: number;
    audienceType: ChargeAudienceType;
    userId: number | null;
    roleId: number | null;
    eventId: number | null;
    active: boolean;
    createdAt: string;
    updatedAt: string | null;
}

interface ChargeAssignmentSearchParams {
    page?: string;
    size?: string;
    sort?: string;
}
