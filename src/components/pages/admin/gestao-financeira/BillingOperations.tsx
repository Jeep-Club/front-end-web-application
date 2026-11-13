"use client";
import { Button } from "@/components/common/button";
import { Table } from "@/components/common/table";
import { useModal } from "@/providers/ModalProvider";
import type { BillingRecord,BillingResource } from "@/schemas/billing/management";
import { listChargeDefinitionsAction } from "@/server/actions/billing/chargeDefinitions/list";
import { getChargeDefinitionAction } from "@/server/actions/billing/chargeDefinitions/get";
import { downloadBillingAction } from "@/server/actions/billing/download";
import { listBillingAction } from "@/server/actions/billing/management";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { useMutation,useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { BillingExport } from "./BillingExport";
import { BillingRecordModal } from "./BillingRecordModal";
import { GenerateChargeCycleModal } from "./GenerateChargeCycleModal";
import { Plus } from "lucide-react";
import { billingLabels,displayBillingValue,saveBillingFile } from "./billingDisplay";

const config = {
    cycles: { title: "Ciclos de cobrança", read: "CHARGE_CYCLE_READ", statuses: ["GENERATED", "CANCELED", "FINISHED", "ARCHIVED"], fields: ["code", "chargeDefinitionNameSnapshot", "dueDate", "status"], labels: ["Referência", "Definição", "Vencimento", "Situação"] },
    "member-charges": { title: "Cobranças dos associados", read: "MEMBER_CHARGE_READ", statuses: ["PENDING", "PAID", "CANCELED"], fields: ["userId", "chargeCycleId", "finalAmount", "dueDate", "effectiveStatus"], labels: ["Associado (matrícula)", "Ciclo", "Valor", "Vencimento", "Situação atual"] },
    payments: { title: "Pagamentos", read: "PAYMENT_READ", statuses: ["PENDING_VALIDATION", "CONFIRMED", "REJECTED", "CANCELED"], fields: ["memberChargeId", "amount", "paymentMethod", "paidAt", "status"], labels: ["Cobrança", "Valor", "Forma", "Pago em", "Situação"] },
    refunds: { title: "Reembolsos", read: "REFUND_READ", statuses: ["ELIGIBLE", "REQUESTED", "APPROVED", "REJECTED", "REFUNDED", "EXPIRED", "CANCELED"], fields: ["userId", "memberPaymentId", "chargeCycleId", "amount", "eligibleUntil", "status"], labels: ["Associado (matrícula)", "Pagamento", "Ciclo", "Valor", "Elegível até", "Situação"] },
};

export function BillingOperations({ resource, initialStatus }: { resource: BillingResource; initialStatus?: string }) {
    const permissions = useUserStore((state) => state.permissions);
    const can = (action: string) => hasPermission(permissions, "BILLING", action);
    const { setContent, setOpen } = useModal();
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [status, setStatus] = useState(initialStatus && config[resource].statuses.includes(initialStatus) ? initialStatus : "");
    const [definitionId, setDefinitionId] = useState("");
    const [userId, setUserId] = useState("");
    const [cycleId, setCycleId] = useState("");
    const settings = config[resource];
    const definitions = useQuery({ queryKey: ["billing", "charge-definitions", "selector"], queryFn: () => listChargeDefinitionsAction({ page: "0", size: "50" }), enabled: resource === "cycles" && can("CHARGE_DEFINITION_READ") });
    const selectedDefinition = useQuery({ queryKey: ["billing", "charge-definitions", "cycle-selection", definitionId], queryFn: () => getChargeDefinitionAction(Number(definitionId)), enabled: resource === "cycles" && can("CHARGE_DEFINITION_READ") && Number(definitionId) > 0 });
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
    const controlClassName = "mt-1.5 block h-11 w-full rounded-xl border border-j-gray-300 bg-j-white px-3 text-sm font-medium text-j-blue-800 outline-none transition-colors placeholder:text-j-gray-400 hover:border-j-gray-400 focus:border-j-blue-500 focus:ring-2 focus:ring-j-blue-100";
    return <section className="flex flex-col gap-4">
        <div className="rounded-2xl border border-j-gray-200 bg-j-white p-4 shadow-sm md:p-5">
            <div className={twMerge("mb-4 flex flex-col gap-3", (resource === "cycles" || resource === "member-charges") && "lg:flex-row lg:items-center lg:justify-between")}>
                <div className="min-w-0">
                    <h2 className="text-base font-extrabold text-j-blue-800">{resource === "cycles" ? "Criar e consultar ciclos de cobrança" : resource === "member-charges" ? "Cobranças dos associados" : "Filtros"}</h2>
                    {resource === "member-charges" ? <p className="mt-1 text-xs text-j-gray-500">Consulte cobranças e localize associados pela matrícula.</p> : <p className="mt-1 text-xs text-j-gray-500">
                        {resource === "cycles" ? "Primeiro, selecione a cobrança que deseja gerar. Depois, clique em “Criar ciclo”." : `Refine a consulta de ${settings.title.toLocaleLowerCase("pt-BR")}.`}
                    </p>}
                </div>
                {(resource === "cycles" || resource === "member-charges") && <div className="grid w-full grid-cols-2 items-center gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-start lg:justify-end">
                    <Button type="button" className={twMerge("h-10 w-full justify-center border border-j-gray-300 bg-j-white px-2 py-0 text-xs text-j-blue-800 hover:bg-j-gray-100 hover:text-j-gray-700 focus-visible:bg-j-gray-100 focus-visible:text-j-gray-700 sm:w-auto sm:px-4 sm:text-sm", !can("EXPORT") && "col-span-2")} onClick={() => { setStatus(""); setUserId(""); setCycleId(""); setDefinitionId(""); setPage(0); }}>Limpar filtros</Button>
                    {can("EXPORT") && <BillingExport kind={resource} filters={exportFilters} mobileActions />}
                    {resource === "cycles" && can("CHARGE_CYCLE_GENERATE") && <div className="col-span-2 flex w-full flex-col gap-1 sm:col-span-1 sm:w-auto sm:min-w-36">
                        <Button type="button" className="h-10 w-full justify-center px-3 py-0 text-xs sm:text-sm" disabled={!selectedDefinition.data || selectedDefinition.data.status !== "ACTIVE" || selectedDefinition.isFetching} onClick={() => { if (selectedDefinition.data) { setContent(<GenerateChargeCycleModal chargeDefinitionId={selectedDefinition.data.id} chargeDefinitionName={selectedDefinition.data.name} />); setOpen(); } }}><Plus size={16} />Criar ciclo</Button>
                    </div>}
                </div>}
            </div>
            <div className={`grid grid-cols-1 items-end gap-3 ${resource === "cycles" ? "" : "sm:grid-cols-2"}`}>
                {resource === "cycles" && <label className="block min-w-0 text-xs font-bold text-j-blue-800"><span className="flex min-h-4 items-center justify-between gap-2"><span>1. Selecione a cobrança <span className="font-semibold text-j-red-500">*</span></span></span><select aria-label="Selecione a cobrança que deseja gerar" value={definitionId} onChange={(event) => change(setDefinitionId, event.target.value)} className={controlClassName}><option value="">Escolha uma cobrança ativa</option>{definitions.data?.content.filter((definition) => definition.status === "ACTIVE").map((definition) => <option key={definition.id} value={definition.id}>{definition.name}</option>)}</select></label>}
                {resource === "member-charges" && <label className="block min-w-0 text-xs font-bold text-j-gray-600">Matrícula do associado<input type="number" min="1" value={userId} onChange={(event) => change(setUserId, event.target.value)} className={controlClassName} /></label>}
                {resource !== "cycles" && !(resource === "refunds" && cycleId) && <label className="block min-w-0 text-xs font-bold text-j-gray-600">Situação<select value={status} onChange={(event) => change(setStatus, event.target.value)} className={controlClassName}><option value="">Todas</option>{settings.statuses.map((value) => <option key={value} value={value}>{billingLabels[value]}</option>)}</select></label>}
                {resource === "refunds" && <label className="block min-w-0 text-xs font-bold text-j-gray-600">Código do ciclo<input type="number" min="1" value={cycleId} onChange={(event) => { change(setCycleId, event.target.value); setStatus(""); }} className={controlClassName} /></label>}
            </div>
            {resource !== "cycles" && resource !== "member-charges" && <div className="mt-4 flex flex-col gap-3 border-t border-j-gray-100 pt-4 sm:flex-row-reverse sm:items-end sm:justify-between">
                <div className="grid w-full grid-cols-2 items-center gap-2 sm:flex sm:w-auto sm:flex-wrap">
                    <Button type="button" className={twMerge("h-10 w-full justify-center border border-j-gray-300 bg-j-white px-2 py-0 text-xs text-j-blue-800 hover:bg-j-gray-100 hover:text-j-gray-700 focus-visible:bg-j-gray-100 focus-visible:text-j-gray-700 sm:w-auto sm:px-4 sm:text-sm", !can("EXPORT") && "col-span-2")} onClick={() => { setStatus(""); setUserId(""); setCycleId(""); setDefinitionId(""); setPage(0); }}>Limpar filtros</Button>
                    {can("EXPORT") && <BillingExport kind={resource} filters={exportFilters} mobileActions />}
                </div>
            </div>}
        </div>
        {definitions.error && resource === "cycles" && <p role="alert" className="text-red-600">{definitions.error.message}</p>}
        {!validFilters ? <p role="alert">Informe códigos maiores que zero.</p>
            : resource === "cycles" && !definitionId ? <p className="rounded-xl border border-dashed border-j-gray-300 p-8 text-center">Selecione uma definição para consultar os ciclos gerados.</p>
                : resource === "member-charges" ? <Table.Root
                    data={records.data?.content ?? []}
                    columns={[]}
                    getRowId={(row) => String(row.id)}
                    isLoading={records.isLoading}
                    isFetching={records.isFetching}
                    pagination={{ pageIndex: page, pageSize: size, pageCount: records.data?.totalPages ?? 0, rowCount: records.data?.totalElements, pageSizeOptions: [5, 10, 20, 50], onChange: (next) => { setPage(next.pageIndex); setSize(next.pageSize); } }}
                    footer={<Table.Pagination itemLabel="cobrança" />}
                >
                    {records.isLoading ? <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: size }, (_, index) => <div key={index} className="h-64 animate-pulse rounded-2xl border border-j-gray-200 bg-j-gray-100" />)}</div>
                        : records.error ? <div role="alert" className="p-6 text-sm text-j-red-500">{records.error.message}</div>
                            : records.data?.content.length ? <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
                                {records.data.content.map((record) => {
                                    if (!("finalAmount" in record)) return null;
                                    const charge = record;
                                    const statusClass = charge.effectiveStatus === "PAID"
                                        ? "bg-j-green-100 text-j-green-800"
                                        : charge.effectiveStatus === "OVERDUE" || charge.effectiveStatus === "EXPIRED"
                                            ? "bg-j-red-100 text-j-red-700"
                                            : "bg-j-gray-100 text-j-gray-700";
                                    const canAdjust = charge.status === "PENDING" && charge.effectiveStatus !== "EXPIRED" && can("MEMBER_CHARGE_UPDATE");
                                    const canCancel = charge.status === "PENDING" && can("MEMBER_CHARGE_CANCEL");
                                    return <article key={charge.id} className="flex min-w-0 flex-col rounded-2xl border border-j-gray-200 bg-j-white p-4 shadow-sm transition-colors hover:border-j-blue-200">
                                        <header className="flex items-start justify-between gap-3 border-b border-j-gray-100 pb-3">
                                            <div className="min-w-0">
                                                <span className="text-[10px] font-bold uppercase tracking-wide text-j-gray-500">Cobrança</span>
                                                <h3 className="mt-1 text-lg font-extrabold text-j-blue-800">#{charge.id}</h3>
                                            </div>
                                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${statusClass}`}>{billingLabels[charge.effectiveStatus]}</span>
                                        </header>
                                        <dl className="grid flex-1 grid-cols-2 gap-x-3 gap-y-4 py-4">
                                            <div className="min-w-0"><dt className="text-[10px] font-bold uppercase tracking-wide text-j-gray-500">Matrícula</dt><dd className="mt-1 truncate text-sm font-semibold text-j-gray-800">{charge.userId}</dd></div>
                                            <div className="min-w-0"><dt className="text-[10px] font-bold uppercase tracking-wide text-j-gray-500">Ciclo</dt><dd className="mt-1 truncate text-sm font-semibold text-j-gray-800">{charge.chargeCycleId}</dd></div>
                                            <div className="min-w-0"><dt className="text-[10px] font-bold uppercase tracking-wide text-j-gray-500">Valor</dt><dd className="mt-1 truncate text-sm font-bold text-j-blue-800">{displayBillingValue("finalAmount", charge.finalAmount)}</dd></div>
                                            <div className="min-w-0"><dt className="text-[10px] font-bold uppercase tracking-wide text-j-gray-500">Vencimento</dt><dd className="mt-1 truncate text-sm font-semibold text-j-gray-800">{displayBillingValue("dueDate", charge.dueDate)}</dd></div>
                                        </dl>
                                        <footer className="flex flex-wrap gap-2 border-t border-j-gray-100 pt-3">
                                            <button className="min-h-9 flex-1 rounded-lg border border-j-gray-200 px-3 py-2 text-xs font-bold text-j-blue-800 transition-colors hover:border-j-blue-200 hover:bg-j-blue-50" onClick={() => open(charge.id, "Detalhes")}>Detalhes</button>
                                            {canAdjust && <button className="min-h-9 flex-1 rounded-lg bg-j-blue-800 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-j-blue-900" onClick={() => open(charge.id, "Ajustar valor", "final-amount", "Altera somente o valor desta cobrança.")}>Ajustar valor</button>}
                                            {canCancel && <button className="min-h-9 flex-1 rounded-lg border border-j-red-200 bg-j-red-50 px-3 py-2 text-xs font-bold text-j-red-700 transition-colors hover:bg-j-red-100" onClick={() => open(charge.id, "Cancelar cobrança", "cancel", "Cancela esta cobrança ainda não paga.")}>Cancelar</button>}
                                        </footer>
                                    </article>;
                                })}
                            </div>
                                : <p className="p-8 text-center text-sm text-j-gray-600">Nenhuma cobrança encontrada para os filtros informados.</p>}
                </Table.Root>
                    : <Table.Root data={records.data?.content ?? []} columns={columns} getRowId={(row) => String(row.id)} isLoading={records.isLoading} isFetching={records.isFetching} error={records.error?.message} emptyState={resource === "payments" ? "Nenhum pagamento registrado. As cobranças aparecem na aba Cobrança; depois que o associado enviar o comprovante pelo Histórico financeiro, o pagamento será listado aqui." : "Nenhum registro encontrado para os filtros informados."} pagination={{ pageIndex: page, pageSize: size, pageCount: records.data?.totalPages ?? 0, rowCount: records.data?.totalElements, pageSizeOptions: [5, 10, 20, 50], onChange: (next) => { setPage(next.pageIndex); setSize(next.pageSize); } }} footer={<Table.Pagination itemLabel="registro" />}><Table.Header title={settings.title} description={resource === "cycles" ? undefined : `${records.data?.totalElements ?? 0} registro(s)`} /><Table.Content loadingRows={size} /></Table.Root>}
    </section>;
}
