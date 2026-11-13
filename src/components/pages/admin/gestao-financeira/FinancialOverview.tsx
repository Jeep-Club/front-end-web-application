"use client";

import { useRouter } from "next/navigation";
import { FinancialDashboard } from "./FinancialDashboard";
import { FinancialPage } from "./FinancialPage";
import { dashboardMovementStatus, type DashboardDestination } from "./financialDashboardModel";

export default function FinancialOverview() {
    const router = useRouter();

    function openDestination(destination: DashboardDestination) {
        if (destination.tab === "movements") {
            const status = dashboardMovementStatus(destination.movement, destination.status);
            const params = new URLSearchParams({ movement: destination.movement });
            if (status) params.set("status", status);
            router.push(`/admin/gestao-financeira/movimentacoes?${params}`);
        } else if (destination.tab === "definitions" || destination.tab === "cycles") {
            router.push(`/admin/gestao-financeira/cobrancas?tab=${destination.tab}`);
        }
    }

    return <FinancialPage title="Visão geral financeira"><FinancialDashboard onNavigate={openDestination} /></FinancialPage>;
}
