"use client";
import { Button } from "@/components/common/button";
import { Table } from "@/components/common/table";
import { useModal } from "@/providers/ModalProvider";
import type { BillingRecord,BillingResource } from "@/schemas/billing/management";
import { listChargeDefinitionsAction } from "@/server/actions/billing/chargeDefinitions/list";
import { downloadBillingAction } from "@/server/actions/billing/download";
import { listBillingAction } from "@/server/actions/billing/management";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { useMutation,useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { BillingExport } from "./BillingExport";
import { BillingRecordModal } from "./BillingRecordModal";
import { billingLabels,displayBillingValue,saveBillingFile } from "./billingDisplay";

const config = {
    cycles: { title: "Ciclos de cobrança", read: "CHARGE_CYCLE_READ", statuses: ["GENERATED", "CANCELED", "FINISHED", "ARCHIVED"], fields: ["code", "chargeDefinitionNameSnapshot", "dueDate", "status"], labels: ["Referência", "Definição", "Vencimento", "Situação"] },
    "member-charges": { title: "Cobranças dos associados", read: "MEMBER_CHARGE_READ", statuses: ["PENDING", "PAID", "CANCELED"], fields: ["userId", "chargeCycleId", "finalAmount", "dueDate", "effectiveStatus"], labels: ["Associado (código)", "Ciclo", "Valor", "Vencimento", "Situação atual"] },
    payments: { title: "Pagamentos", read: "PAYMENT_READ", statuses: ["PENDING_VALIDATION", "CONFIRMED", "REJECTED", "CANCELED"], fields: ["memberChargeId", "amount", "paymentMethod", "paidAt", "status"], labels: ["Cobrança", "Valor", "Forma", "Pago em", "Situação"] },
    refunds: { title: "Reembolsos", read: "REFUND_READ", statuses: ["ELIGIBLE", "REQUESTED", "APPROVED", "REJECTED", "REFUNDED", "EXPIRED", "CANCELED"], fields: ["userId", "memberPaymentId", "chargeCycleId", "amount", "eligibleUntil", "status"], labels: ["Associado (código)", "Pagamento", "Ciclo", "Valor", "Elegível até", "Situação"] },
};

export function BillingOperations({ resource }: { resource: BillingResource }) {
    const permissions = useUserStore((state) => state.permissions);
    const can = (action: string) => hasPermission(permissions, "BILLING", action);
    const { setContent, setOpen } = useModal();
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [status, setStatus] = useState("");
    const [definitionId, setDefinitionId] = useState("");
    const [userId, setUserId] = useState("");
    const [cycleId, setCycleId] = useState("");
    const settings = config[resource];
    const definitions = useQuery({ queryKey: ["billing", "charge-definitions", "selector"], queryFn: () => listChargeDefinitionsAction({ page: "0", size: "50" }), enabled: resource === "cycles" && can("CHARGE_DEFINITION_READ") });
    const filters = { page, size, ...(resource === "cycles" && definitionId ? { definitionId: Number(definitionId) } : {}), ...(resource === "member-charges" && userId ? { userId: Number(userId) } : {}), ...(resource === "refunds" && cycleId ? { cycleId: Number(cycleId) } : {}), ...(status ? { status } : {}) };
    const validFilters = (!userId || Number(userId) > 0) && (!cycleId || Number(cycleId) > 0) && (!definitionId || Number(definitionId) > 0);
    const records = useQuery({ queryKey: ["billing", resource, filters], queryFn: () => listBillingAction(resource, filters), enabled: can(settings.read) && validFilters && (resource !== "cycles" || Number(definitionId) > 0), placeholderData: (previous) => previous });
    const receipt = useMutation({ mutationFn: async (id: number) => saveBillingFile(await downloadBillingAction("receipt", "PDF", {}, id)) });
    function open(id: number, title: string, operation?: string, explanation?: string) { setContent(<BillingRecordModal resource={resource} id={id} title={title} operation={operation} explanation={explanation} />); setOpen(); }
    const columns: ColumnDef<BillingRecord, unknown>[] = [
        { accessorKey: "id", header: "Código" },
        ...settings.fields.map((field, index): ColumnDef<BillingRecord, unknown> => ({ id: field, header: settings.labels[index], accessorFn: (row) => (row as Record<string, unknown>)[field], cell: ({ getValue, row }) => <span className={field.toLowerCase().includes("status") ? "rounded-full bg-j-gray-100 px-2 py-1 text-xs font-bold" : ""}>{(row.original as Record<string, unknown>)[`${field}Label`] as string || displayBillingValue(field, getValue())}</span> })),
        { id: "actions", header: "Ações", cell: ({ row }) => {
            const item = row.original;
            const actions: { title: string; operation: string; explanation: string }[] = [];
            const add = (allowed: boolean, permission: string, title: string, operation: string, explanation: string) => { if (allowed && can(permission)) actions.push({ title, operation, explanation }); };
            if (resource === "cycles") {
                add(item.status === "GENERATED", "CHARGE_CYCLE_CANCEL", "Cancelar ciclo", "cancel", "Cancela as cobranças abertas e cria elegibilidade de reembolso para pagamentos confirmados. Confira o ciclo antes de confirmar.");
                add(item.status === "GENERATED", "CHARGE_CYCLE_FINISH", "Finalizar ciclo", "finish", "Finalizar organiza o ciclo e não quita nem cancela suas cobranças.");
                add(["FINISHED", "CANCELED"].includes(item.status), "CHARGE_CYCLE_ARCHIVE", "Arquivar ciclo", "archive", "Arquiva o histórico do ciclo. Não altera os pagamentos.");
            } else if (resource === "member-charges") {
                add(item.status === "PENDING" && "effectiveStatus" in item && item.effectiveStatus !== "EXPIRED", "MEMBER_CHARGE_UPDATE", "Ajustar valor", "final-amount", "Altera somente o valor desta cobrança.");
                add(item.status === "PENDING", "MEMBER_CHARGE_CANCEL", "Cancelar cobrança", "cancel", "Cancela esta cobrança ainda não paga.");
            } else if (resource === "payments") {
                add(item.status === "PENDING_VALIDATION", "PAYMENT_CONFIRM", "Confirmar pagamento", "confirm", "Confirme após conferir o comprovante e o recebimento. A cobrança será quitada; ciclos cancelados seguem as regras de reembolso.");
                add(item.status === "PENDING_VALIDATION", "PAYMENT_REJECT", "Rejeitar pagamento", "reject", "Informe o motivo para permitir que o associado corrija o pagamento.");
            } else {
                const until = "eligibleUntil" in item ? item.eligibleUntil : null;
                const expired = !!until && new Date(until).getTime() < Date.now();
                add(item.status === "REQUESTED" || item.status === "ELIGIBLE" && !expired, "REFUND_APPROVE", "Aprovar reembolso", "approve", "Aprova a solicitação. O registro como realizado deve ocorrer após a devolução.");
                add(item.status === "REQUESTED", "REFUND_REJECT", "Rejeitar reembolso", "reject", "Informe o motivo da rejeição.");
                add(item.status === "APPROVED", "REFUND_MARK_AS_REFUNDED", "Registrar devolução", "mark-as-refunded", "Confirme somente se o dinheiro já foi devolvido ao associado. Esta ação registra a devolução.");
                add(item.status === "ELIGIBLE" && expired, "REFUND_EXPIRE", "Expirar elegibilidade", "expire", "Registra o encerramento da janela de elegibilidade.");
                add(["ELIGIBLE", "REQUESTED", "APPROVED"].includes(item.status), "REFUND_CANCEL", "Cancelar reembolso", "cancel", "Encerra este processo de reembolso.");
            }
            return <div className="flex flex-wrap justify-end gap-2"><button className="rounded-lg border border-j-gray-200 px-3 py-2 text-xs font-bold" onClick={() => open(item.id, "Detalhes")}>Detalhes</button>{resource === "payments" && "receiptUrl" in item && item.receiptUrl && <button className="rounded-lg border border-j-gray-200 px-3 py-2 text-xs font-bold" disabled={receipt.isPending} onClick={() => receipt.mutate(item.id)}>Comprovante</button>}{actions.map((action) => <button key={action.operation} className="rounded-lg bg-j-blue-800 px-3 py-2 text-xs font-bold text-white" onClick={() => open(item.id, action.title, action.operation, action.explanation)}>{action.title}</button>)}</div>;
        } },
    ];
    const change = (setter: (value: string) => void, value: string) => { setter(value); setPage(0); };
    if (!can(settings.read)) return <p className="rounded-xl bg-j-white p-6">Seu usuário não possui permissão para consultar {settings.title.toLowerCase()}.</p>;
    const exportFilters: Record<string, string> = {};
    if (status) exportFilters.status = status;
    if (resource === "cycles" && definitionId) exportFilters.chargeDefinitionId = definitionId;
    if (resource === "member-charges" && userId) exportFilters.userId = userId;
    if (resource === "refunds" && cycleId) exportFilters.chargeCycleId = cycleId;
    return <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-j-gray-200 bg-j-white p-4 md:p-6">
            {resource === "cycles" && <label className="flex min-w-0 flex-1 flex-col text-xs font-semibold text-j-gray-600 sm:min-w-40 sm:max-w-64">Definição<select aria-label="Definição de cobrança" value={definitionId} onChange={(event) => change(setDefinitionId, event.target.value)} className="mt-2 block h-10 w-full rounded-lg border border-j-gray-300 bg-j-white px-3 text-sm text-j-blue-800"><option value="">Selecione uma definição</option>{definitions.data?.content.map((definition) => <option key={definition.id} value={definition.id}>{definition.name}</option>)}</select></label>}
            {resource === "cycles" && <label className="flex min-w-0 flex-1 flex-col text-xs font-semibold text-j-gray-600 sm:min-w-40 sm:max-w-64">Ou código da definição<input type="number" min="1" value={definitionId} onChange={(event) => change(setDefinitionId, event.target.value)} className="mt-2 block h-10 w-full rounded-lg border border-j-gray-300 bg-j-white px-3 text-sm text-j-blue-800" /></label>}
            {resource !== "cycles" && !(resource === "refunds" && cycleId) && <label className="flex min-w-0 flex-1 flex-col text-xs font-semibold text-j-gray-600 sm:min-w-40 sm:max-w-64">Situação<select value={status} onChange={(event) => change(setStatus, event.target.value)} className="mt-2 block h-10 w-full rounded-lg border border-j-gray-300 bg-j-white px-3 text-sm text-j-blue-800"><option value="">Todas</option>{settings.statuses.map((value) => <option key={value} value={value}>{billingLabels[value]}</option>)}</select></label>}
            {resource === "member-charges" && <label className="flex min-w-0 flex-1 flex-col text-xs font-semibold text-j-gray-600 sm:min-w-40 sm:max-w-64">Código do associado<input type="number" min="1" value={userId} onChange={(event) => change(setUserId, event.target.value)} className="mt-2 block h-10 w-full rounded-lg border border-j-gray-300 bg-j-white px-3 text-sm text-j-blue-800" /></label>}
            {resource === "refunds" && <label className="flex min-w-0 flex-1 flex-col text-xs font-semibold text-j-gray-600 sm:min-w-40 sm:max-w-64">Código do ciclo<input type="number" min="1" value={cycleId} onChange={(event) => { change(setCycleId, event.target.value); setStatus(""); }} className="mt-2 block h-10 w-full rounded-lg border border-j-gray-300 bg-j-white px-3 text-sm text-j-blue-800" /></label>}
            <Button type="button" className="h-10 px-4 py-0 text-sm" onClick={() => { setStatus(""); setUserId(""); setCycleId(""); setDefinitionId(""); setPage(0); }}>Limpar filtros</Button>
            {can("EXPORT") && <BillingExport kind={resource} filters={exportFilters} />}
        </div>
        {definitions.error && resource === "cycles" && <p role="alert" className="text-red-600">{definitions.error.message}</p>}
        {!validFilters ? <p role="alert">Informe códigos maiores que zero.</p> : resource === "cycles" && !definitionId ? <p className="rounded-xl border border-dashed border-j-gray-300 p-8 text-center">Selecione uma definição para consultar os ciclos gerados.</p> : <Table.Root data={records.data?.content ?? []} columns={columns} getRowId={(row) => String(row.id)} isLoading={records.isLoading} isFetching={records.isFetching} error={records.error?.message} emptyState="Nenhum registro encontrado para os filtros informados." pagination={{ pageIndex: page, pageSize: size, pageCount: records.data?.totalPages ?? 0, rowCount: records.data?.totalElements, pageSizeOptions: [5, 10, 20, 50], onChange: (next) => { setPage(next.pageIndex); setSize(next.pageSize); } }} footer={<Table.Pagination itemLabel="registro" />}><Table.Header title={settings.title} description={`${records.data?.totalElements ?? 0} registro(s)`} /><Table.Content loadingRows={size} /></Table.Root>}
    </section>;
}
