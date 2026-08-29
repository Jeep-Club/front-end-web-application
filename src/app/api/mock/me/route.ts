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
        "BILLING_CHARGE_DEFINITION_READ",
        "BILLING_CHARGE_DEFINITION_CREATE",
        "BILLING_CHARGE_DEFINITION_UPDATE",
        "BILLING_CHARGE_ASSIGNMENT_READ",
        "BILLING_CHARGE_ASSIGNMENT_CREATE",
        "BILLING_CHARGE_ASSIGNMENT_UPDATE",
        "DASHBOARD_METRICS_VIEW"
    ]
}, { status: 200 });
}