import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const authorization = request.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
        return NextResponse.json(
            { message: "Token não informado" },
            { status: 401 },
        );
    }

    return NextResponse.json(
        {
            userId: 1,
            userName: "Administrador Supremo",
            sessionId: 1,
            sessionActive: true,
            expiresInSeconds: 3600,
            authorities: [
                "AUTHORIZATION_ROLE_READ",
                "AUTHORIZATION_ROLE_CREATE",
                "AUTHORIZATION_ROLE_UPDATE",
                "AUTHORIZATION_ROLE_ENABLE",
                "AUTHORIZATION_ROLE_DISABLE",
                "AUTHORIZATION_ROLE_DELETE",

                "AUTHORIZATION_PERMISSION_READ",
                "AUTHORIZATION_PERMISSION_ASSIGN",
                "AUTHORIZATION_PERMISSION_REVOKE",

                "AUTHORIZATION_USER_ROLE_READ",
                "AUTHORIZATION_USER_ROLE_ASSIGN",
                "AUTHORIZATION_USER_ROLE_REVOKE",
            ],
        },
        { status: 200 },
    );
}