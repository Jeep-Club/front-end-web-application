type UserStatus =
    | 'ACTIVE'
    | 'DISABLED'
    | 'LOCKED'
    | 'CHANGE_PASSWORD_REQUIRED'
    | 'PENDING_FIRST_ACCESS';

/**
 * Espelha os campos publicamente exibiveis do UserProfile do backend
 * (com.jeepclub.backend.authentication.core.domain.model.User), sem os
 * campos internos de credencial/seguranca (passwordHash, failedLoginAttempts,
 * accountStatus/authenticationStatus/credentialStatus brutos) — esses ultimos
 * tres sao projetados pelo backend em um unico campo `status` (User.getStatus()).
 */
interface UserProfile {
    id: number;
    name: string;
    birthDate: string | null;
    email: string;
    cpf: string;
    rg: string | null;
    phoneNumber: string | null;
    profilePhotoUrl: string | null;
    status: UserStatus;
    createdAt: string;
    lastLoginAt: string | null;
}

type GetUserProfileResponse = UserProfile;
