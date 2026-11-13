"use client";

import { useState } from "react";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import type { PaymentFilters } from "@/schemas/payments";
import PaymentsPage from "../payments";
import { BillingOperations } from "./BillingOperations";
import { FinancialPage } from "./FinancialPage";

export type MovementView = "refunds" | "payments" | "member-charges" | "analysis";

export default function FinancialMovements({ initialMovement, initialStatus }: {
    initialMovement: MovementView;
    initialStatus?: string;
}) {
    const permissions = useUserStore((state) => state.permissions);
    const [paymentFilters, setPaymentFilters] = useState<PaymentFilters>({ status: "PENDING_VALIDATION", page: 0, size: 20 });
    const sections = [
        { key: "member-charges", label: "Cobranças", permission: "MEMBER_CHARGE_READ" },
        { key: "payments", label: "Pagamentos", permission: "PAYMENT_READ" },
        { key: "analysis", label: "Análises", permission: "PAYMENT_READ" },
        { key: "refunds", label: "Reembolsos", permission: "REFUND_READ" },
    ] as const;
    const [selection, setSelection] = useState<MovementView>();
    const canRead = (permission: string) => hasPermission(permissions, "BILLING", permission);
    const active = selection ?? initialMovement;
    const section = sections.find(({ key }) => key === active)!;
    const status = selection === undefined ? initialStatus : undefined;

    return (
        <FinancialPage title="Movimentações financeiras">
            <div role="tablist" aria-label="Tipos de movimentação" className="grid w-full grid-cols-4 gap-1 rounded-xl border border-input-border bg-j-white p-1">
                {sections.map(({ key, label }, index) => (
                    <button
                        key={key}
                        id={`movement-tab-${key}`}
                        type="button"
                        role="tab"
                        aria-selected={active === key}
                        aria-controls="movement-panel"
                        tabIndex={active === key ? 0 : -1}
                        onClick={() => { if (active !== key) setSelection(key); }}
                        onKeyDown={(event) => {
                            const last = sections.length - 1;
                            const next = event.key === "ArrowRight" ? (index + 1) % sections.length
                                : event.key === "ArrowLeft" ? (index + last) % sections.length
                                    : event.key === "Home" ? 0 : event.key === "End" ? last : undefined;
                            if (next === undefined) return;
                            event.preventDefault();
                            const nextKey = sections[next].key;
                            if (nextKey !== active) setSelection(nextKey);
                            document.getElementById(`movement-tab-${nextKey}`)?.focus();
                        }}
                        className={`min-h-11 min-w-0 cursor-pointer rounded-lg px-1 py-2 text-xs font-bold [overflow-wrap:anywhere] focus-visible:outline-2 focus-visible:outline-input-border-focus sm:text-sm ${active === key ? "bg-j-blue-800 text-j-yellow-300" : "text-primary hover:bg-background-secondary"}`}
                    >
                        {label}
                    </button>
                ))}
            </div>
            <section id="movement-panel" role="tabpanel" aria-labelledby={`movement-tab-${active}`}>
                {!canRead(section.permission) ? (
                    <p className="rounded-xl bg-j-white p-4 text-secondary">Você não tem permissão para consultar esta seção.</p>
                ) : active === "analysis" ? (
                    <PaymentsPage filters={paymentFilters} embedded onFiltersChange={setPaymentFilters} />
                ) : (
                    <BillingOperations key={`${active}:${status ?? ""}`} resource={active} initialStatus={status} />
                )}
            </section>
        </FinancialPage>
    );
}
