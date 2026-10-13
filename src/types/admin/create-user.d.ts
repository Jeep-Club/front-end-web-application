type AdminUserActivationMethod = "TEMPORARY_PASSWORD" | "EMAIL_INVITATION";
type AdminInvitationStatus = "QUEUED" | "SENT" | "DELIVERY_FAILED";

interface AdminCreateUserForm {
    name: string;
    birthDate: string;
    email: string;
    cpf: string;
    rg: string;
    phoneNumber: string;
    activationMethod: AdminUserActivationMethod | "";
}

interface AdminCreateUserBaseRequest {
    name: string;
    birthDate: string | null;
    email: string | null;
    cpf: string;
    rg: string | null;
    phoneNumber: string | null;
}

type AdminCreateUserRequest = AdminCreateUserBaseRequest & (
    | { activationMethod: "TEMPORARY_PASSWORD" }
    | { activationMethod: "EMAIL_INVITATION" }
);

type AdminCreateUserResponse =
    | {
        userId: number;
        activationMethod: "TEMPORARY_PASSWORD";
        temporaryPassword: string;
    }
    | {
        userId: number;
        activationMethod: "EMAIL_INVITATION";
        invitationStatus: AdminInvitationStatus;
    };

interface AdminUserInvitationStatusResponse {
    userId: number;
    invitationStatus: AdminInvitationStatus;
}
