import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { FinancialDashboardView } from "./FinancialDashboardView";
import type { DashboardQueueGroup, FinancialDashboardViewProps } from "./financialDashboardModel";

const destinations: FinancialDashboardViewProps["metrics"][number]["destination"] = { tab: "movements", movement: "member-charges" };
const metrics: FinancialDashboardViewProps["metrics"] = [
    { id: "pending", title: "Cobranças em aberto", value: 14, description: "Inclui cobranças em atraso e expiradas", tone: "amber", loading: false, destination: { ...destinations, status: "PENDING" } },
    { id: "paid", title: "Cobranças pagas", value: 27, description: "Quitadas por pagamentos confirmados", tone: "green", loading: false, destination: { ...destinations, status: "PAID" } },
    { id: "validation", title: "Pagamentos para validar", value: 3, description: "Comprovantes aguardando análise", tone: "violet", loading: false, destination: { tab: "movements", movement: "analysis", status: "PENDING_VALIDATION" } },
    { id: "refunds", title: "Reembolsos solicitados", value: 2, description: "Solicitações aguardando decisão", tone: "amber", loading: false, destination: { tab: "movements", movement: "refunds", status: "REQUESTED" } },
];
const groups: FinancialDashboardViewProps["queue"]["groups"] = [
    { id: "payments", label: "Pagamentos", total: 3, loading: false },
    { id: "refunds", label: "Reembolsos", total: 2, loading: false },
    { id: "returns", label: "Devoluções", total: 1, loading: false },
];
const items: Record<DashboardQueueGroup, FinancialDashboardViewProps["queue"]["items"]> = {
    payments: [
        { id: 101, title: "Pagamento #101", description: "Aguardando validação", amount: 150, date: "2026-11-10", destination: { tab: "movements", movement: "analysis", status: "PENDING_VALIDATION" } },
        { id: 102, title: "Pagamento #102", description: "Aguardando validação", amount: 75, date: "2026-11-09", destination: { tab: "movements", movement: "analysis", status: "PENDING_VALIDATION" } },
        { id: 103, title: "Pagamento #103", description: "Aguardando validação", amount: 120, date: "2026-11-08", destination: { tab: "movements", movement: "analysis", status: "PENDING_VALIDATION" } },
    ],
    refunds: [
        { id: 201, title: "Reembolso #201", description: "Solicitado pelo associado", amount: 50, date: "2026-11-08", destination: { tab: "movements", movement: "refunds", status: "REQUESTED" } },
        { id: 202, title: "Reembolso #202", description: "Solicitado pelo associado", amount: 35, date: "2026-11-07", destination: { tab: "movements", movement: "refunds", status: "REQUESTED" } },
    ],
    returns: [{ id: 301, title: "Devolução #301", description: "Reembolso aprovado", amount: 40, date: "2026-11-07", destination: { tab: "movements", movement: "refunds", status: "APPROVED" } }],
};

const meta = {
    title: "Páginas/Admin/Gestão financeira/Dashboard",
    component: FinancialDashboardView,
    tags: ["autodocs"],
    parameters: {
        docs: { description: { component: "View isolada do Dashboard financeiro. Todos os dados desta página são fixtures sintéticas; a configuração de cobrança é uma representação textual, pois o bloco real é injetado pelo container e depende de integração autenticada." } },
    },
    args: {
        metrics,
        distribution: {
            segments: [
                { id: "PAID", label: "Pagas", count: 27, tone: "green", destination: { ...destinations, status: "PAID" } },
                { id: "PENDING", label: "Em aberto", count: 14, tone: "amber", destination: { ...destinations, status: "PENDING" } },
                { id: "CANCELED", label: "Canceladas", count: 4, tone: "blue", destination: { ...destinations, status: "CANCELED" } },
            ], loading: false, available: true,
        },
        queue: { groups, selected: "payments", items: items.payments, total: 3, loading: false, destination: { tab: "movements", movement: "analysis" } },
        updatedAt: new Date("2026-11-12T12:00:00-03:00").getTime(),
        refreshing: false,
        onRefresh: fn(), onNavigate: fn(), onQueueChange: fn(), onRetryQueue: fn(),
        configuration: <p className="rounded-xl border border-dashed p-4">Cobrança de referência da associação — bloco real fornecido pelo container.</p>,
    },
} satisfies Meta<typeof FinancialDashboardView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populado: Story = {
    render: function InteractiveDashboard(args) {
        const [selected, setSelected] = useState<DashboardQueueGroup>("payments");
        return <FinancialDashboardView {...args} queue={{ ...args.queue, selected, items: items[selected], total: groups.find((group) => group.id === selected)?.total }} onQueueChange={(group) => { args.onQueueChange(group); setSelected(group); }} />;
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: /^Reembolsos 2$/ }));
        await expect(args.onQueueChange).toHaveBeenCalledWith("refunds");
        await expect(canvas.getByText("Reembolso #201")).toBeVisible();
    },
};

export const Carregando: Story = {
    args: {
        metrics: metrics.map((metric) => ({ ...metric, value: undefined, loading: true })),
        distribution: { segments: [], loading: true, available: true },
        queue: { groups: groups.map((group) => ({ ...group, loading: true })), items: [], loading: true },
        refreshing: true,
    },
};

export const SemDados: Story = {
    args: {
        metrics: metrics.map((metric) => ({ ...metric, value: 0 })),
        distribution: { segments: [{ id: "PAID", label: "Pagas", count: 0, tone: "green", destination: { ...destinations, status: "PAID" } }, { id: "PENDING", label: "Em aberto", count: 0, tone: "amber", destination: { ...destinations, status: "PENDING" } }, { id: "CANCELED", label: "Canceladas", count: 0, tone: "blue", destination: { ...destinations, status: "CANCELED" } }], loading: false, available: true },
        queue: { groups: groups.map((group) => ({ ...group, total: 0 })), selected: "payments", items: [], total: 0, loading: false },
    },
};

export const FalhaNaConsulta: Story = {
    args: {
        metrics: metrics.map((metric) => ({ ...metric, value: undefined, error: "Falha ao consultar este indicador." })),
        distribution: { segments: [], loading: false, error: "Falha ao consultar a distribuição.", available: true },
        queue: { groups, selected: "payments", items: [], loading: false, error: "Falha ao consultar a fila." },
    },
};

export const AcessoLimitado: Story = {
    args: {
        metrics: [metrics[2]],
        distribution: { segments: [], loading: false, available: false },
        queue: { groups: [groups[0]], selected: "payments", items: items.payments, total: 3, loading: false },
        configuration: undefined,
    },
};
