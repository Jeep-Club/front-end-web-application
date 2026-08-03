import { NextRequest, NextResponse } from "next/server";
<<<<<<< Updated upstream

export async function GET(request: NextRequest) {
    const authorization = request.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
        return NextResponse.json(
            { message: "Token não informado" },
            { status: 401 }
        );
    }

    return NextResponse.json(
        {
            userId: 1,
            userName: "Administrador Mock",
            sessionId: 1,
            sessionActive: true,
            expiresInSeconds: 3600,
            authorities: [
                  "AUTHORIZATION_ROLE_CREATE",

        "AUTHORIZATION_ROLE_READ",

        "FINANCE_INVOICE_APPROVE",

        "DASHBOARD_METRICS_VIEW"
            ]
=======

export async function GET(request: NextRequest) {
    const authorization = request.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
        return NextResponse.json(
            { message: "Token não informado" },
            { status: 401 }
        );
    }

    return NextResponse.json(
        {
            userId: 1,
            userName: "Administrador Mock",
            sessionId: 1,
            sessionActive: true,
            expiresInSeconds: 3600,
            authorities: [
    "EVENTS_CREATE",
    "EVENTS_UPDATE",
    "EVENTS_CANCEL"
            ]
            
>>>>>>> Stashed changes
        },
        { status: 200 }
    );
}