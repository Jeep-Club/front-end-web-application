type LoginResponse = (AuthResponse | LoginResponsePassword) & {
    status: string;
} 

interface LoginResponsePassword {
    passwordChangeToken: string;
    passwordChangeTokenExpiresAt: string;
}