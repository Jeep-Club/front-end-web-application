interface AdminFirstAccessUserRequest {
    name: string;
    birthDate: string | null;
    email: string;
    cpf: string;
    rg: string | null;
    phoneNumber: string;
}

interface AdminFirstAccessUserResponse {
    userId: number;
    temporaryPassword: string;
}
