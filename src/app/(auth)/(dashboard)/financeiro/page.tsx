import Financeiro from "@/components/pages/financeiro";

export default function FinanceiroPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; sort?: string; page?: string }>;
}) {
    return <Financeiro searchParams={searchParams} />;
}
