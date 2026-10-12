import { NextRequest, NextResponse } from "next/server";
import { getAuthCookies } from "@/utils/auth/get";
import fetchRefreshToken from "@/utils/auth/refresh";
import { login } from "@/utils/auth/login";

export async function GET(request: NextRequest) {
    const key = request.nextUrl.searchParams.get("key");
    if (!key?.trim() || key.length > 512 || key.includes("\u0000")) {
        return new NextResponse("O parâmetro 'key' é obrigatório", { status: 400 });
    }

    const apiURL = process.env.API_URL;
    if (!apiURL) {
        return new NextResponse("API_URL não configurada", { status: 500 });
    }

    const authCookies = await getAuthCookies.SERVER();
    if (!authCookies?.AuthAccessToken) {
        return new NextResponse("Não autorizado", { status: 401 });
    }

    let token = authCookies.AuthAccessToken;
    const expires = authCookies.AccessTokenExpiration;
    const isExpired = expires ? new Date(expires) < new Date() : true;

    if (isExpired && authCookies.AuthRefreshToken) {
        try {
            const refreshResponse = await fetchRefreshToken({
                ApiURL: apiURL,
                refreshToken: authCookies.AuthRefreshToken,
            });
            token = refreshResponse.accessToken;
            await login(
                refreshResponse.accessToken,
                refreshResponse.refreshToken,
                new Date(Date.now() + refreshResponse.expiresInSeconds * 1000).toISOString(),
            );
        } catch {
            return new NextResponse("Sessão expirada", { status: 401 });
        }
    }

    try {
        const backendUrl = `${apiURL}/media/images?key=${encodeURIComponent(key)}`;
        const res = await fetch(backendUrl, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });

        if (!res.ok) {
            return new NextResponse(await res.text() || "N?o foi poss?vel carregar a imagem.", {
                status: res.status,
                headers: { "Cache-Control": "private, no-store" },
            });
        }

        const contentType = res.headers.get("Content-Type") || "image/jpeg";
        if (!contentType.toLowerCase().startsWith("image/")) {
            return new NextResponse("A API retornou um conte?do que n?o ? uma imagem.", {
                status: 502,
                headers: { "Cache-Control": "private, no-store" },
            });
        }
        const buffer = await res.arrayBuffer();

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "private, no-store",
            },
        });
    } catch {
        return new NextResponse("Erro ao resolver imagem do storage", { status: 500 });
    }
}
