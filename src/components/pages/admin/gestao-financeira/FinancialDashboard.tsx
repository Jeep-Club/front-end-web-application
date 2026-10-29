"use client";

import type { BillingResource } from "@/schemas/billing/management";
import { listChargeDefinitionsAction } from "@/server/actions/billing/chargeDefinitions/list";
import { listBillingAction } from "@/server/actions/billing/management";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { useQueries } from "@tanstack/react-query";
import { ArrowRight,ClipboardCheck,Coins,FileText,Undo2 } from "lucide-react";

export type FinancialTab = "dashboard" | "definitions" | BillingResource;

export function FinancialDashboard({ onNavigate }: { onNavigate: (tab: FinancialTab) => void }) {
    const permissions = useUserStore((state) => state.permissions);
    const can = (action: string) => hasPermission(permissions, "BILLING", action);
    const cards = [
        { title: "Definições cadastradas", description: "Regras de cobrança do clube", permission: "CHARGE_DEFINITION_READ", tab: "definitions" as const, icon: FileText, load: async () => (await listChargeDefinitionsAction({ page: "0", size: "1" })).totalElements },
        { title: "Cobranças em aberto", description: "Inclui cobranças em atraso e expiradas", permission: "MEMBER_CHARGE_READ", tab: "member-charges" as const, icon: Coins, load: async () => (await listBillingAction("member-charges", { page: 0, size: 1, status: "PENDING" })).totalElements },
        { title: "Cobranças pagas", description: "Quitadas por pagamentos confirmados", permission: "MEMBER_CHARGE_READ", tab: "member-charges" as const, icon: ClipboardCheck, load: async () => (await listBillingAction("member-charges", { page: 0, size: 1, status: "PAID" })).totalElements },
        { title: "Pagamentos para validar", description: "Comprovantes aguardando análise", permission: "PAYMENT_READ", tab: "payments" as const, icon: ClipboardCheck, load: async () => (await listBillingAction("payments", { page: 0, size: 1, status: "PENDING_VALIDATION" })).totalElements },
        { title: "Reembolsos solicitados", description: "Solicitações aguardando decisão", permission: "REFUND_READ", tab: "refunds" as const, icon: Undo2, load: async () => (await listBillingAction("refunds", { page: 0, size: 1, status: "REQUESTED" })).totalElements },
        { title: "Devoluções a realizar", description: "Reembolsos aprovados ainda não devolvidos", permission: "REFUND_READ", tab: "refunds" as const, icon: Undo2, load: async () => (await listBillingAction("refunds", { page: 0, size: 1, status: "APPROVED" })).totalElements },
    ].filter((card) => can(card.permission));
    const counts = useQueries({ queries: cards.map((card) => ({ queryKey: ["billing", "dashboard", card.title], queryFn: card.load, staleTime: 30_000 })) });

    return <section className="flex flex-col gap-5" aria-label="Dashboard financeiro">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{cards.map((card, index) => {
            const query = counts[index];
            const Icon = card.icon;
            return <article key={card.title} className="flex min-w-0 flex-col rounded-2xl border border-j-gray-200 bg-j-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3"><h3 className="text-sm font-bold text-j-blue-800">{card.title}</h3><Icon size={22} className="shrink-0 text-j-blue-800" /></div>
                <p className="my-3 text-3xl font-black text-j-blue-800" aria-live="polite">{query.isPending ? "…" : query.isError ? "—" : query.data?.toLocaleString("pt-BR")}</p>
                <p className="text-xs text-j-gray-600">{card.description}</p>
                {query.error && <p role="alert" className="mt-2 text-xs text-red-600">{query.error.message}</p>}
                <button type="button" className="mt-4 flex items-center gap-2 text-sm font-bold text-j-blue-800" onClick={() => onNavigate(card.tab)}>Consultar <ArrowRight size={15} /></button>
            </article>;
        })}</div>
    </section>;
}
