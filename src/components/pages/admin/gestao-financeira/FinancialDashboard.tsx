"use client";

import { useState } from "react";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { listChargeDefinitionsAction } from "@/server/actions/billing/chargeDefinitions/list";
import { listBillingAction } from "@/server/actions/billing/management";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { billingLabels } from "./billingDisplay";
import { MembershipBilling } from "./MembershipBilling";
import { FinancialDashboardView } from "./FinancialDashboardView";
import type { DashboardDestination, DashboardMetric, DashboardQueueGroup, DashboardQueueItem, DashboardSegment } from "./financialDashboardModel";

export type FinancialTab = "dashboard" | "definitions" | "cycles" | "movements";

const chargeStatuses = ["PENDING", "PAID", "CANCELED"] as const;
const queueGroups = [
    { id: "payments" as const, label: "Pagamentos", resource: "payments" as const, status: "PENDING_VALIDATION", permission: "PAYMENT_READ", destination: { tab: "movements", movement: "analysis", status: "PENDING_VALIDATION" } as const },
    { id: "refunds" as const, label: "Reembolsos", resource: "refunds" as const, status: "REQUESTED", permission: "REFUND_READ", destination: { tab: "movements", movement: "refunds", status: "REQUESTED" } as const },
    { id: "returns" as const, label: "Devoluções", resource: "refunds" as const, status: "APPROVED", permission: "REFUND_READ", destination: { tab: "movements", movement: "refunds", status: "APPROVED" } as const },
];

export function FinancialDashboard({ onNavigate }: { onNavigate: (destination: DashboardDestination) => void }) {
    const permissions = useUserStore(state => state.permissions);
    const can = (action: string) => hasPermission(permissions, "BILLING", action);
    const canReadCharges = can("MEMBER_CHARGE_READ");
    const canReadDefinitions = can("CHARGE_DEFINITION_READ");
    const canReadMembership = hasPermission(permissions, "MEMBERSHIP", "BILLING_CONFIGURATION_READ");
    const queryClient = useQueryClient();
    const [selectedQueue, setSelectedQueue] = useState<DashboardQueueGroup>("payments");
    const [manualRefresh, setManualRefresh] = useState(false);

    // Count-only reads use totalElements; pending lists reuse their first page's
    // total instead of loading every payment or treating a partial sum as cash flow.
    const charges = useQueries({ queries: chargeStatuses.map(status => ({
        queryKey: ["billing", "dashboard", "charges", status],
        queryFn: () => listBillingAction("member-charges", { page: 0, size: 1, status }),
        enabled: canReadCharges,
        staleTime: 30_000,
        retry: false,
    })) });
    const queues = useQueries({ queries: queueGroups.map(group => ({
        queryKey: ["billing", "dashboard", group.resource, group.status],
        queryFn: () => listBillingAction(group.resource, { page: 0, size: 5, status: group.status }),
        enabled: can(group.permission),
        staleTime: 30_000,
        retry: false,
    })) });
    const definitions = useQuery({
        queryKey: ["billing", "dashboard", "definitions"],
        queryFn: () => listChargeDefinitionsAction({ page: "0", size: "1" }),
        enabled: canReadDefinitions,
        staleTime: 30_000,
        retry: false,
    });

    const metricSpecs = [
        { id: "pending", title: "Cobranças em aberto", description: "Inclui débitos em atraso e expirados", tone: "amber" as const, enabled: canReadCharges, query: charges[0], destination: { tab: "movements", movement: "member-charges", status: "PENDING" } as const },
        { id: "paid", title: "Cobranças quitadas", description: "Pagamentos confirmados no histórico", tone: "green" as const, enabled: canReadCharges, query: charges[1], destination: { tab: "movements", movement: "member-charges", status: "PAID" } as const },
        { id: "validation", title: "Pagamentos para validar", description: "Comprovantes aguardando sua análise", tone: "blue" as const, enabled: can("PAYMENT_READ"), query: queues[0], destination: queueGroups[0].destination },
        { id: "refunds", title: "Reembolsos solicitados", description: "Solicitações aguardando uma decisão", tone: "violet" as const, enabled: can("REFUND_READ"), query: queues[1], destination: queueGroups[1].destination },
    ];
    const metrics: DashboardMetric[] = metricSpecs.filter(metric => metric.enabled).map(({ query, ...metric }) => ({
        ...metric, value: query.data?.totalElements, loading: query.isPending, error: query.error?.message,
    }));
    const distributionError = canReadCharges ? charges.find(query => query.isError)?.error?.message : undefined;
    const segments: DashboardSegment[] = canReadCharges && charges.every(query => query.isSuccess) ? [
        { id: "PAID", label: "Quitadas", count: charges[1].data!.totalElements, tone: "green", destination: { tab: "movements", movement: "member-charges", status: "PAID" } },
        { id: "PENDING", label: "Em aberto", count: charges[0].data!.totalElements, tone: "amber", destination: { tab: "movements", movement: "member-charges", status: "PENDING" } },
        { id: "CANCELED", label: "Canceladas", count: charges[2].data!.totalElements, tone: "blue", destination: { tab: "movements", movement: "member-charges", status: "CANCELED" } },
    ] : [];
    const availableGroups = queueGroups.map((group, index) => ({ ...group, query: queues[index] })).filter(group => can(group.permission));
    const activeQueue = availableGroups.find(group => group.id === selectedQueue) ?? availableGroups[0];
    const queueItems: DashboardQueueItem[] = activeQueue?.query.data?.content.flatMap(record => {
        if ("paymentMethod" in record) return [{
            id: record.id, title: `Pagamento #${record.id}`, description: `Cobrança #${record.memberChargeId} · ${billingLabels[record.paymentMethod] ?? record.paymentMethod}`,
            amount: record.amount, date: record.createdAt ?? record.paidAt, destination: activeQueue.destination,
        }];
        if ("memberPaymentId" in record) return [{
            id: record.id, title: `${activeQueue.id === "returns" ? "Devolução" : "Reembolso"} #${record.id}`,
            description: `Associado #${record.userId} · Cobrança #${record.memberChargeId}`, amount: record.amount,
            date: activeQueue.id === "returns" ? record.approvedAt : record.requestedAt, destination: activeQueue.destination,
        }];
        return [];
    }) ?? [];
    const activeQueries = [...(canReadCharges ? charges : []), ...availableGroups.map(group => group.query), ...(canReadDefinitions ? [definitions] : [])];
    const updatedAt = Math.max(0, ...activeQueries.map(query => query.dataUpdatedAt));

    return <FinancialDashboardView
        metrics={metrics}
        distribution={{ segments, available: canReadCharges, loading: canReadCharges && charges.some(query => query.isPending), error: distributionError }}
        queue={{ groups: availableGroups.map(group => ({ id: group.id, label: group.label, total: group.query.data?.totalElements, loading: group.query.isPending })), selected: activeQueue?.id, items: queueItems, total: activeQueue?.query.data?.totalElements, loading: activeQueue?.query.isPending ?? false, error: activeQueue?.query.error?.message, destination: activeQueue?.destination }}
        updatedAt={updatedAt || undefined}
        refreshing={manualRefresh || activeQueries.some(query => query.isFetching)}
        onRefresh={() => {
            setManualRefresh(true);
            void Promise.allSettled([
                queryClient.invalidateQueries({ queryKey: ["billing", "dashboard"] }),
                ...(canReadMembership ? [queryClient.invalidateQueries({ queryKey: ["membership", "billing-configuration"] })] : []),
            ]).finally(() => setManualRefresh(false));
        }}
        onQueueChange={setSelectedQueue}
        onRetryQueue={() => { void activeQueue?.query.refetch(); }}
        onNavigate={onNavigate}
        configuration={canReadMembership ? <MembershipBilling /> : undefined}
    />;
}
