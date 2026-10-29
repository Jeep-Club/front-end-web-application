type UserStatus =
    | 'ACTIVE'
    | 'DISABLED'
    | 'LOCKED'
    | 'CHANGE_PASSWORD_REQUIRED'
    | 'PENDING_FIRST_ACCESS';

/** View model do perfil; a action normaliza email ausente para string vazia. */
interface UserProfile {
    id: number;
    name: string;
    birthDate: string | null;
    email: string;
    membershipNumber?: string | null;
    cpf: string;
    rg: string | null;
    phoneNumber: string | null;
    profilePhotoUrl: string | null;
    status: UserStatus;
    createdAt: string;
    lastLoginAt: string | null;
}

type GetUserProfileResponse = UserProfile;

/**
 * Dados de GET /identity/me com URL da foto derivada para a apresentação.
 */
interface MeProfileResponse {
    id: number;
    name: string;
    birthDate: string | null;
    email: string | null;
    membershipNumber?: string | null;
    profileCompletionPending?: boolean;
    cpf: string;
    rg: string | null;
    phoneNumber: string | null;
    profilePhotoStorageKey: string | null;
    profilePhotoUrl: string | null;
    status: 'ACTIVE' | 'DISABLED';
    createdAt: string;
    disabledAt: string | null;
    updatedAt: string | null;
}
