interface AuthResponse {
    refreshToken: string;
    accessToken: z.string;
    expiresInSeconds: z.number;
}