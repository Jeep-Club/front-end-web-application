"use client";
import { Button } from "@/components/common/button";
import { AdminExport } from "@/components/common/admin-export/AdminExport";
import { downloadBillingAction } from "@/server/actions/billing/download";
import { decodeFinancialCsv,downloadFinancialReport } from "@/utils/financial-export/report";
import { useRef,useState } from "react";
import { billingLabels } from "./billingDisplay";
import { twMerge } from "tailwind-merge";

export function BillingExport({ kind, filters = {}, variant = "primary", className, mobileActions = false }: { kind: "definitions" | "cycles" | "member-charges" | "payments" | "refunds"; filters?: Record<string, string>; variant?: "primary" | "secondary"; className?: string; mobileActions?: boolean }) {
    const filterDialog = useRef<HTMLDialogElement>(null);
    const [advanced, setAdvanced] = useState<Record<string, string>>({});
    async function exportReport(format: "CSV" | "PDF") {
        const combined = { ...filters, ...advanced };
        if (combined.month && !combined.year) throw new Error("Informe o ano ao filtrar por mês.");
        if (combined.dueFrom && combined.dueTo && combined.dueFrom > combined.dueTo) throw new Error("O vencimento inicial deve preceder o final.");
        const source = await downloadBillingAction(kind, "CSV", combined);
        await downloadFinancialReport(kind, format, decodeFinancialCsv(source.base64), combined, source.filename, source.exportedBy);
    }
    const statuses = { definitions: ["ACTIVE", "INACTIVE", "ARCHIVED"], cycles: ["GENERATED", "FINISHED", "CANCELED", "ARCHIVED"], "member-charges": ["PENDING", "PAID", "CANCELED"], payments: ["PENDING_VALIDATION", "CONFIRMED", "REJECTED", "CANCELED"], refunds: ["ELIGIBLE", "REQUESTED", "APPROVED", "REJECTED", "REFUNDED", "EXPIRED", "CANCELED"] };
    const fields = [
        ["id", "Código do registro", "number"], ["userId", "Matrícula do associado", "number"],
        ["chargeDefinitionId", "Código da definição", "number"], ["chargeCycleId", "Código do ciclo", "number"], ["eventId", "Código do evento", "number"],
        ["year", "Ano", "number"], ["month", "Mês", "number"], ["dueFrom", "Vencimento de", "date"], ["dueTo", "Vencimento até", "date"],
        ["from", "Período desde", "datetime-local"], ["to", "Período até", "datetime-local"],
    ];
    return <div className={twMerge(mobileActions ? "contents [&>button]:w-full [&>button]:px-2 [&>button:last-of-type]:col-span-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2 sm:[&>button]:w-auto sm:[&>button]:px-4 sm:[&>button:last-of-type]:col-span-1" : "flex flex-wrap items-center gap-2", className)}>
        <AdminExport label="Exportar relatório" onExport={exportReport} className={twMerge(variant === "secondary" && "[&>select]:border-j-gray-300", mobileActions && "w-full sm:w-auto")} />
        <Button type="button" onClick={() => filterDialog.current?.showModal()} className="h-10 whitespace-nowrap border border-j-gray-300 bg-j-white px-4 py-0 text-sm text-j-blue-800 hover:bg-j-gray-100">Filtros do relatório</Button><dialog ref={filterDialog} aria-label="Filtros do relatório" className="m-auto max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-3xl overflow-y-auto rounded-2xl border border-j-gray-200 bg-j-white p-5 text-sm shadow-xl backdrop:bg-black/40"><header className="mb-4 flex items-center justify-between gap-4"><h2 className="text-lg font-bold text-j-blue-800">Filtros do relatório</h2><button type="button" aria-label="Fechar filtros do relatório" onClick={() => filterDialog.current?.close()} className="rounded-lg p-2">✕</button></header><p className="my-2 text-xs">A exportação inclui todos os resultados da API, além da página atual. Os filtros preenchidos abaixo complementam os da listagem.</p><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{fields.filter(([key]) => !(kind === "cycles" && key === "userId") && !(kind === "definitions" && ["chargeCycleId", "year", "month", "dueFrom", "dueTo"].includes(key))).map(([key, label, type]) => <label key={key}>{label}<input type={type} min={type === "number" ? "1" : undefined} max={key === "month" ? "12" : undefined} value={type === "datetime-local" && advanced[key] ? new Date(advanced[key]).toLocaleString("sv-SE").slice(0, 16).replace(" ", "T") : advanced[key] ?? ""} onChange={(event) => setAdvanced({ ...advanced, [key]: type === "datetime-local" && event.target.value ? new Date(event.target.value).toISOString() : event.target.value })} className="mt-1 block w-full rounded-lg border border-j-gray-300 p-2" /></label>)}
        <label>Situação do registro<select value={advanced.status ?? filters.status ?? ""} onChange={(event) => setAdvanced({ ...advanced, status: event.target.value })} className="mt-1 block w-full rounded-lg border p-2"><option value="">Todas</option>{statuses[kind].map((status) => <option key={status} value={status}>{billingLabels[status] ?? ({ ACTIVE: "Ativa", INACTIVE: "Inativa" } as Record<string, string>)[status]}</option>)}</select></label>
        <label>Recorrência<select value={advanced.recurrence ?? ""} onChange={(event) => setAdvanced({ ...advanced, recurrence: event.target.value })} className="mt-1 block w-full rounded-lg border p-2"><option value="">Todas</option><option value="ONE_TIME">Única</option><option value="MONTHLY">Mensal</option><option value="YEARLY">Anual</option></select></label>
        {["member-charges", "payments", "refunds"].includes(kind) && <><label>Situação da cobrança<select value={advanced.chargeStatus ?? ""} onChange={(event) => setAdvanced({ ...advanced, chargeStatus: event.target.value })} className="mt-1 block w-full rounded-lg border p-2"><option value="">Todas</option><option value="PENDING">Pendente</option><option value="PAID">Paga</option><option value="CANCELED">Cancelada</option></select></label>
        <label>Situação efetiva<select value={advanced.effectiveStatus ?? ""} onChange={(event) => setAdvanced({ ...advanced, effectiveStatus: event.target.value })} className="mt-1 block w-full rounded-lg border p-2"><option value="">Todas</option><option value="PENDING">Pendente</option><option value="OVERDUE">Em atraso</option><option value="EXPIRED">Expirada</option><option value="PAID">Paga</option><option value="CANCELED">Cancelada</option></select></label>
        </>}{kind === "payments" && <label>Forma de pagamento<select value={advanced.paymentMethod ?? ""} onChange={(event) => setAdvanced({ ...advanced, paymentMethod: event.target.value })} className="mt-1 block w-full rounded-lg border p-2"><option value="">Todas</option><option value="PIX">Pix</option><option value="CASH">Dinheiro</option><option value="BANK_TRANSFER">Transferência</option><option value="CREDIT_CARD">Crédito</option><option value="DEBIT_CARD">Débito</option><option value="OTHER">Outro</option></select></label>}
        </div><button type="button" className="mt-2 underline" onClick={() => setAdvanced({})}>Limpar filtros do relatório</button><div className="mt-5 flex justify-end"><Button type="button" className="h-10 px-4 py-0 text-sm" onClick={() => filterDialog.current?.close()}>Concluir</Button></div></dialog>
    </div>;
}
