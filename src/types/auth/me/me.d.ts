interface MeResponse {
    userId: number;
    userName: string;
    sessionId: number;
    sessionActive: boolean;
    expiresInSeconds: number;
    authorities: string[];
}

type MeCookie = Omit<MeResponse, 'authorities' | 'expiresInSeconds'> & { expires: string };