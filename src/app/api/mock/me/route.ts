import { NextRequest, NextResponse } from "next/server";

export function GET() {
    return NextResponse.json({
    userId: 10293,
    userName: "João Gabriel de Faria Beserra",
    sessionId: 987654321,
    sessionActive: true,
    expiresInSeconds: 3600,
    authorities: [
        "AUTHORIZATION_ROLE_CREATE",
        "AUTHORIZATION_ROLE_READ",
        "FINANCE_INVOICE_APPROVE",
        "DASHBOARD_METRICS_VIEW"
    ]
}, { status: 200 });
}