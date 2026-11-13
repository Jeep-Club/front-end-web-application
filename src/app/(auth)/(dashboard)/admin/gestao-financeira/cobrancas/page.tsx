import ChargeSetup from "@/components/pages/admin/gestao-financeira/ChargeSetup";

export default async function ChargeSetupPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
    const { tab } = await searchParams;
    return <ChargeSetup initialSection={tab === "cycles" ? "cycles" : "definitions"} />;
}
