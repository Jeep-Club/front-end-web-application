import FinancialManagement, { type MovementView } from "@/components/pages/admin/gestao-financeira";

export default async function FinancialManagementPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    const params = await searchParams;
    const tab = typeof params.tab === "string" ? params.tab : undefined;
    const movement = typeof params.movement === "string" ? params.movement : undefined;
    const allowedTabs = ["dashboard", "definitions", "cycles", "movements"];
    const allowedMovements: MovementView[] = ["refunds", "payments", "member-charges", "analysis"];
    return <FinancialManagement
        initialTab={allowedTabs.includes(tab ?? "") ? tab as "dashboard" | "definitions" | "cycles" | "movements" : "dashboard"}
        initialMovement={allowedMovements.includes(movement as MovementView) ? movement as MovementView : "member-charges"}
    />;
}
