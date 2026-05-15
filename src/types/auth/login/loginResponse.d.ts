interface LoginResponse {
    refreshToken: string;
    accessToken: z.string;
    expiresInSeconds: z.number;
}