interface MeResponse {
    userId: number;
    sessionId: number;
    sessionActive: boolean;
    expiresInSeconds: number;
}

interface IdentityMeResponse {
    id: number;
    name: string;
    birthDate: string | null;
    email: string;
    cpf: string;
    rg: string | null;
    phoneNumber: string | null;
    profilePhotoUrl: string | null;
    status: 'ACTIVE' | 'DISABLED';
    createdAt: string;
    disabledAt: string | null;
    updatedAt: string | null;
}

interface AuthorizationMeResponse {
    userId: number;
    authorities: string[];
}

interface MeCookie {
    userId: number;
    userName: string;
    sessionId: number;
    sessionActive: boolean;
    expires: string;
}
