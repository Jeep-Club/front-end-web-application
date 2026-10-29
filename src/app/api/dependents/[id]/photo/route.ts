import { NextResponse } from 'next/server';
import { getAuthCookies } from '@/utils/auth/get';
import { frontendHeaders } from '@/services/fetchWrapper/frontendHeaders';
import fetchRefreshToken from '@/utils/auth/refresh';
import { login } from '@/utils/auth/login';

const privateHeaders = { 'Cache-Control': 'private, no-store, max-age=0', Vary: 'Cookie' };
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    if (!/^[1-9]\d*$/.test(id)) return new NextResponse(null, { status: 400, headers: privateHeaders });
    const apiURL = process.env.API_URL;
    if (!apiURL) return new NextResponse(null, { status: 503, headers: privateHeaders });
    const auth = await getAuthCookies.SERVER();
    if (!auth?.AuthAccessToken) return new NextResponse(null, { status: 401, headers: privateHeaders });
    try {
        const send = (token: string) => fetch(`${apiURL}/dependents/${id}/photo`, { cache: 'no-store', headers: frontendHeaders({ Authorization: `Bearer ${token}` }) });
        let response = await send(auth.AuthAccessToken);
        if (response.status === 401 && auth.AuthRefreshToken) {
            const refreshed = await fetchRefreshToken({ ApiURL: apiURL, refreshToken: auth.AuthRefreshToken });
            await login(refreshed.accessToken, refreshed.refreshToken, new Date(Date.now() + refreshed.expiresInSeconds * 1000).toISOString());
            response = await send(refreshed.accessToken);
        }
        if (!response.ok) return new NextResponse(null, { status: response.status, headers: privateHeaders });
        const type = response.headers.get('Content-Type')?.split(';')[0].toLowerCase() ?? '';
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(type)) return new NextResponse(null, { status: 502, headers: privateHeaders });
        return new NextResponse(response.body, { headers: { ...privateHeaders, 'Content-Type': type, 'X-Content-Type-Options': 'nosniff' } });
    } catch { return new NextResponse(null, { status: 503, headers: privateHeaders }); }
}
