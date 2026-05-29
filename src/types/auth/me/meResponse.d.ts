interface MeResponse {
    userId: number;
    sessionId: number;
    sessionActive: boolean;
    expiresInSeconds: number;
    authorities: string[];
}