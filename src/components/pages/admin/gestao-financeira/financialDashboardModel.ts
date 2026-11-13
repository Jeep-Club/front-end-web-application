import type { ReactNode } from "react";

export type DashboardMovement = "refunds" | "payments" | "member-charges" | "analysis";
export type DashboardDestination = { tab: "definitions" | "cycles" } | { tab: "movements"; movement: DashboardMovement; status?: string };
export type DashboardTone = "blue" | "green" | "amber" | "violet";
export type DashboardQueueGroup = "payments" | "refunds" | "returns";

const movementStatuses: Record<DashboardMovement, readonly string[]> = {
    "member-charges": ["PENDING", "PAID", "CANCELED"],
    payments: ["PENDING_VALIDATION", "CONFIRMED", "REJECTED", "CANCELED"],
    analysis: ["PENDING_VALIDATION", "CONFIRMED", "REJECTED", "CANCELED"],
    refunds: ["ELIGIBLE", "REQUESTED", "APPROVED", "REJECTED", "REFUNDED", "EXPIRED", "CANCELED"],
};

/** These are persisted API filters; OVERDUE/EXPIRED are not charge status filters. */
export function dashboardMovementStatus(movement: DashboardMovement, status: unknown): string | undefined {
    return typeof status === "string" && movementStatuses[movement].includes(status) ? status : undefined;
}

export interface DashboardMetric {
    id: string;
    title: string;
    value?: number;
    description: string;
    tone: DashboardTone;
    loading: boolean;
    error?: string;
    destination: DashboardDestination;
}

export interface DashboardSegment {
    id: "PAID" | "PENDING" | "CANCELED";
    label: string;
    count: number;
    tone: DashboardTone;
    destination: DashboardDestination;
}

export interface DashboardQueueItem {
    id: number;
    title: string;
    description: string;
    amount: number;
    date?: string | null;
    destination: DashboardDestination;
}

/** Full totals come from totalElements. Queue amounts always describe individual records. */
export interface FinancialDashboardViewProps {
    metrics: DashboardMetric[];
    distribution: { segments: DashboardSegment[]; loading: boolean; error?: string; available: boolean };
    queue: {
        groups: { id: DashboardQueueGroup; label: string; total?: number; loading: boolean }[];
        selected?: DashboardQueueGroup;
        items: DashboardQueueItem[];
        total?: number;
        loading: boolean;
        error?: string;
        destination?: DashboardDestination;
    };
    shortcuts: { label: string; description: string; destination: DashboardDestination }[];
    updatedAt?: number;
    refreshing: boolean;
    onRefresh: () => void;
    onNavigate: (destination: DashboardDestination) => void;
    onQueueChange: (group: DashboardQueueGroup) => void;
    onRetryQueue: () => void;
    configuration?: ReactNode;
}

export function distributionPercentage(count: number, total: number): number {
    return total > 0 ? Math.round(count / total * 100) : 0;
}
