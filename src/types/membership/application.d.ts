type MembershipApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";

interface MembershipApplicationForm {
    name: string;
    cpf: string;
    phoneNumber: string;
    email?: string;
    message?: string;
}

interface MembershipApplicationSubmission {
    id: number;
    status: MembershipApplicationStatus;
    created: boolean;
}

interface MembershipApplication {
    id: number;
    userId?: number | null;
    name: string;
    cpf: string;
    email: string | null;
    phoneNumber: string;
    message: string | null;
    status: MembershipApplicationStatus;
    rejectionReason: string | null;
    requestedAt: string;
    updatedAt: string;
}

interface MembershipApplicationPage extends PageResponse<MembershipApplication> {}

interface TemporaryPasswordApproval {
    userId: number;
    temporaryPassword: string;
}

interface AccessLinkApproval {
    userId: number;
}
