import FinancialOverview from "@/components/pages/admin/gestao-financeira/FinancialOverview";
import { redirect } from "next/navigation";

export default async function FinancialOverviewPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    const { tab, movement, status } = await searchParams;
    if (tab === "definitions" || tab === "cycles") {
        redirect(`/admin/gestao-financeira/cobrancas?tab=${tab}`);
    }
    if (tab === "movements") {
        const params = new URLSearchParams();
        if (typeof movement === "string") params.set("movement", movement);
        if (typeof status === "string") params.set("status", status);
        redirect(`/admin/gestao-financeira/movimentacoes?${params}`);
    }
    return <FinancialOverview />;
}
