import FinancialMovements, { type MovementView } from "@/components/pages/admin/gestao-financeira/FinancialMovements";
import { dashboardMovementStatus } from "@/components/pages/admin/gestao-financeira/financialDashboardModel";

export default async function FinancialMovementsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    const { movement, status } = await searchParams;
    const initialMovement: MovementView = movement === "refunds" || movement === "payments" || movement === "analysis" ? movement : "member-charges";
    const initialStatus = dashboardMovementStatus(initialMovement, status);
    return <FinancialMovements key={`${initialMovement}:${initialStatus ?? ""}`} initialMovement={initialMovement} initialStatus={initialStatus} />;
}
