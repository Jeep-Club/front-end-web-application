import FinancialManagement, { type MovementView } from "@/components/pages/admin/gestao-financeira";
import type { FinancialTab } from "@/components/pages/admin/gestao-financeira/FinancialDashboard";
import { dashboardMovementStatus } from "@/components/pages/admin/gestao-financeira/financialDashboardModel";

export default async function FinancialManagementPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    const params = await searchParams;
    const tab = typeof params.tab === "string" ? params.tab : undefined;
    const movement = typeof params.movement === "string" ? params.movement : undefined;
    const allowedTabs = ["dashboard", "definitions", "cycles", "movements"];
    const allowedMovements: MovementView[] = ["refunds", "payments", "member-charges", "analysis"];
    const initialMovement = allowedMovements.includes(movement as MovementView) ? movement as MovementView : "member-charges";
    return <FinancialManagement
        initialTab={allowedTabs.includes(tab ?? "") ? tab as FinancialTab : "dashboard"}
        initialMovement={initialMovement}
        initialStatus={dashboardMovementStatus(initialMovement, params.status)}
    />;
}
