"use client";

import { useQuery } from "@tanstack/react-query";
import { Archive,CalendarPlus,Eye,FileText,Pencil,Plus,Power,PowerOff,ShieldX,Users } from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

import { Button,ButtonIcon } from "@/components/common/button";
import { Table } from "@/components/common/table";
import { useModal } from "@/providers/ModalProvider";
import { listChargeDefinitionsAction } from "@/server/actions/billing/chargeDefinitions/list";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { ArchiveChargeDefinitionModal } from "./ArchiveChargeDefinitionModal";
import { BillingExport } from "./BillingExport";
import { BillingOperations } from "./BillingOperations";
import { ChargeAssignmentsModal } from "./ChargeAssignmentsModal";
import { ChargeDefinitionDetailsModal } from "./ChargeDefinitionDetailsModal";
import {
	CHARGE_DEFINITION_STATUS_LABEL,
	CHARGE_DEFINITION_STATUS_STYLE,
	CHARGE_RECURRENCE_LABEL,
	formatCurrencyBRL,
} from "./chargeDefinitionDisplay";
import { CreateChargeDefinitionModal } from "./CreateChargeDefinitionModal";
import { EditChargeDefinitionModal } from "./EditChargeDefinitionModal";
import { GenerateChargeCycleModal } from "./GenerateChargeCycleModal";
import { ToggleChargeDefinitionStatusModal } from "./ToggleChargeDefinitionStatusModal";

import { FinancialPage } from "./FinancialPage";
import { FinancialSectionNav } from "./FinancialSectionNav";

const PAGE_SIZE = 10;

function ChargeDefinitions() {
    const { setContent, setOpen } = useModal();
    const permissions = useUserStore((state) => state.permissions);

    const canRead = hasPermission(permissions, "BILLING", "CHARGE_DEFINITION_READ");
    const canCreate = hasPermission(permissions, "BILLING", "CHARGE_DEFINITION_CREATE");
    const canUpdate = hasPermission(permissions, "BILLING", "CHARGE_DEFINITION_UPDATE");
    const canReadAssignments = hasPermission(permissions, "BILLING", "CHARGE_ASSIGNMENT_READ");
    const canGenerate = hasPermission(permissions, "BILLING", "CHARGE_CYCLE_GENERATE");
    const canExport = hasPermission(permissions, "BILLING", "EXPORT");

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);
    const [sort, setSort] = useState<string>();

    const searchParams: ChargeDefinitionSearchParams = {
        page: String(page),
        size: String(pageSize),
        ...(sort ? { sort } : {}),
    };

    const { data, isLoading, isFetching, error, refetch } = useQuery({
        queryKey: ["billing", "charge-definitions", searchParams],
        queryFn: () => listChargeDefinitionsAction(searchParams),
        placeholderData: (previous) => previous,
        enabled: canRead,
    });

    const handleOpenCreate = () => {
        setContent(<CreateChargeDefinitionModal />);
        setOpen();
    };

    const handleOpenEdit = (id: number) => {
        setContent(<EditChargeDefinitionModal chargeDefinitionId={id} />);
        setOpen();
    };

    const handleOpenToggleStatus = (definition: ChargeDefinitionSummary) => {
        setContent(
            <ToggleChargeDefinitionStatusModal
                chargeDefinitionId={definition.id}
                chargeDefinitionName={definition.name}
                nextStatus={definition.status === "ACTIVE" ? "DEACTIVATE" : "ACTIVATE"}
            />,
        );
        setOpen();
    };

    const handleOpenArchive = (definition: ChargeDefinitionSummary) => {
        setContent(
            <ArchiveChargeDefinitionModal
                chargeDefinitionId={definition.id}
                chargeDefinitionName={definition.name}
            />,
        );
        setOpen();
    };

    const handleOpenAssignments = (definition: ChargeDefinitionSummary) => {
        setContent(
            <ChargeAssignmentsModal
                chargeDefinitionId={definition.id}
                chargeDefinitionName={definition.name}
                chargeDefinitionStatus={definition.status}
            />,
        );
        setOpen();
    };

    const handleOpenGenerateCycle = (definition: ChargeDefinitionSummary) => {
        setContent(
            <GenerateChargeCycleModal
                chargeDefinitionId={definition.id}
                chargeDefinitionName={definition.name}
            />,
        );
        setOpen();
    };

    const renderDefinitionActions = (definition: ChargeDefinitionSummary) => {
        const isArchived = definition.status === "ARCHIVED";
        const iconActionClass = "flex h-10 w-10 items-center justify-center rounded-xl border border-j-gray-200 bg-j-white text-j-blue-800 transition-colors hover:border-j-blue-200 hover:bg-j-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800";

        return <div className="flex w-full flex-col gap-3">
            {(canReadAssignments || canGenerate && definition.status === "ACTIVE") && <div className="grid w-full grid-cols-1 gap-2">
                {canReadAssignments && <Button type="button" onClick={() => handleOpenAssignments(definition)} aria-label={`Associar membros a ${definition.name}`} className="h-10 w-full min-w-0 whitespace-nowrap border border-j-blue-200 bg-j-blue-50 px-2 text-xs text-j-blue-800 hover:bg-j-blue-100 hover:text-j-blue-800 focus-visible:bg-j-blue-100 sm:px-3 sm:text-sm"><Users size={16} />Associar</Button>}
                {canGenerate && definition.status === "ACTIVE" && <Button type="button" onClick={() => handleOpenGenerateCycle(definition)} aria-label={`Gerar cobrança para ${definition.name}`} className="h-10 w-full min-w-0 whitespace-nowrap bg-j-yellow-300 px-2 text-xs text-j-blue-800 hover:bg-j-yellow-400 hover:text-j-blue-800 sm:px-3 sm:text-sm"><CalendarPlus size={16} />Gerar cobrança</Button>}
            </div>}
            <div className="flex w-full items-center justify-end gap-2 border-t border-j-gray-200 pt-3">
                <ButtonIcon type="button" title="Visualizar" aria-label={`Visualizar ${definition.name}`} onClick={() => { setContent(<ChargeDefinitionDetailsModal id={definition.id} />); setOpen(); }} className={iconActionClass}><Eye size={18} /></ButtonIcon>
                {canUpdate && !isArchived && <ButtonIcon type="button" title="Editar" aria-label={`Editar ${definition.name}`} onClick={() => handleOpenEdit(definition.id)} className={iconActionClass}><Pencil size={18} /></ButtonIcon>}
                {canUpdate && !isArchived && <ButtonIcon type="button" title={definition.status === "ACTIVE" ? "Desativar" : "Ativar"} aria-label={`${definition.status === "ACTIVE" ? "Desativar" : "Ativar"} ${definition.name}`} onClick={() => handleOpenToggleStatus(definition)} className={twMerge(iconActionClass, definition.status === "ACTIVE" ? "text-j-red-500 hover:border-j-red-200 hover:bg-j-red-100 hover:text-j-red-600" : "text-j-green-700 hover:border-j-green-200 hover:bg-j-green-100 hover:text-j-green-700")}>{definition.status === "ACTIVE" ? <PowerOff size={18} /> : <Power size={18} />}</ButtonIcon>}
                {canUpdate && !isArchived && <ButtonIcon type="button" title="Arquivar" aria-label={`Arquivar ${definition.name}`} onClick={() => handleOpenArchive(definition)} className={twMerge(iconActionClass, "text-j-red-500 hover:border-j-red-200 hover:bg-j-red-100 hover:text-j-red-600")}><Archive size={18} /></ButtonIcon>}
            </div>
        </div>;
    };

    return (
        <div className="w-full">
            <div className="flex w-full flex-col gap-4 pb-6">

                {!canRead ? (
                    <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-j-gray-300 bg-j-white p-6 text-center">
                        <ShieldX size={42} className="mb-3 text-j-gray-400" />
                        <h3 className="text-lg font-black text-j-blue-800">Acesso não permitido</h3>
                        <p className="mt-1 max-w-md text-sm text-j-gray-600">
                            Seu usuário não possui permissão para visualizar as definições de cobrança.
                        </p>
                    </section>
                ) : (
                    <Table.Root
                        data={data?.content ?? []}
                        columns={[]}
                        getRowId={(definition) => String(definition.id)}
                        pagination={{
                            pageIndex: page,
                            pageSize,
                            pageCount: data?.totalPages ?? 0,
                            rowCount: data?.totalElements,
                            pageSizeOptions: [5, 10, 20, 50],
                            onChange: (next) => {
                                setPage(next.pageIndex);
                                setPageSize(next.pageSize);
                            },
                        }}
                        footer={<Table.Pagination itemLabel="definição" showCount={false} />}
                        isLoading={isLoading}
                        isFetching={isFetching}
                        className="overflow-hidden"
                    >
                        <Table.Header
                            title="Definições de cobrança"
                            description="Regras e valores das cobranças do clube."
                            className="gap-3 lg:flex-wrap lg:items-start"
                        >
                            <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
                                <label className="flex h-10 shrink-0 items-center rounded-lg border border-j-gray-300 bg-j-white px-2">
                                    <select aria-label="Ordenar definições" value={sort ?? ""} onChange={(event) => { setSort(event.target.value || undefined); setPage(0); }} className="w-24 bg-transparent text-xs font-semibold text-j-blue-800 focus-visible:outline-2">
                                        <option value="">Padrão</option>
                                        <option value="name,asc">Nome (A–Z)</option>
                                        <option value="name,desc">Nome (Z–A)</option>
                                        <option value="defaultAmount,asc">Menor valor</option>
                                        <option value="defaultAmount,desc">Maior valor</option>
                                    </select>
                                </label>
                                {canExport && <BillingExport kind="definitions" variant="secondary" className="min-w-0" />}
                                {canCreate && <Button type="button" onClick={handleOpenCreate} className="h-10 w-full shrink-0 whitespace-nowrap px-4 py-0 text-sm sm:w-auto"><Plus size={16} strokeWidth={3} />Criar definição</Button>}
                            </div>
                        </Table.Header>
                        {error ? <div role="alert" className="flex flex-col items-center gap-3 px-5 py-14 text-center"><p className="text-sm text-j-red-500">{error.message}</p><Button onClick={() => { void refetch(); }}>Tentar novamente</Button></div>
                            : isLoading ? <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: Math.min(pageSize, 6) }, (_, index) => <div key={index} className="h-56 animate-pulse rounded-2xl border border-j-gray-200 bg-j-gray-100" />)}</div>
                                : data?.content.length ? <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">{data.content.map((definition) => <article key={definition.id} className="group flex min-w-0 flex-col rounded-2xl border border-j-gray-200 bg-j-white p-4 transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200 hover:-translate-y-0.5 hover:border-j-blue-200 hover:shadow-md sm:p-5">
                                    <header className="flex min-w-0 items-start justify-between gap-3">
                                        <div className="min-w-0"><span className="text-[10px] font-bold uppercase tracking-wider text-j-gray-500">Definição de cobrança</span><h3 className="mt-1 break-words text-lg font-extrabold text-j-blue-800">{definition.name}</h3></div>
                                        <span className={twMerge("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide", CHARGE_DEFINITION_STATUS_STYLE[definition.status])}>{CHARGE_DEFINITION_STATUS_LABEL[definition.status]}</span>
                                    </header>
                                    <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-j-gray-100/70 p-3">
                                        <div className="col-span-2"><p className="text-[10px] font-bold uppercase tracking-wide text-j-gray-500">Valor padrão</p><p className="mt-1 text-base font-extrabold text-j-blue-800">{formatCurrencyBRL(definition.defaultAmount)}</p></div>
                                        <div><p className="text-[10px] font-bold uppercase tracking-wide text-j-gray-500">Recorrência</p><p className="mt-1 text-sm font-bold text-j-gray-700">{CHARGE_RECURRENCE_LABEL[definition.recurrenceType]}</p></div>
                                        <div><p className="text-[10px] font-bold uppercase tracking-wide text-j-gray-500">Obrigatória</p><p className="mt-1 text-sm font-bold text-j-gray-700">{definition.required ? "Sim" : "Não"}</p></div>
                                    </div>
                                    <footer className="mt-auto pt-4">
                                        {renderDefinitionActions(definition)}
                                    </footer>
                                </article>)}</div>
                                    : <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
                                        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-j-blue-800/5 text-j-blue-800"><FileText size={26} /></span>
                                        <h3 className="text-lg font-extrabold text-j-blue-800">{canCreate ? "Nenhuma definição cadastrada" : "Nenhuma definição disponível"}</h3>
                                        <p className="mt-2 max-w-md text-sm leading-relaxed text-j-gray-600">{canCreate ? "Crie uma definição para organizar as cobranças e os valores aplicados aos associados." : "As regras e os valores das cobranças aparecerão aqui quando forem cadastrados."}</p>
                                    </div>}
                    </Table.Root>
                )}
            </div>
        </div>
    );
}

export default function ChargeSetup({ initialSection }: { initialSection: "definitions" | "cycles" }) {
    const permissions = useUserStore((state) => state.permissions);
    return (
        <FinancialPage title="Configuração de cobranças">
            <FinancialSectionNav label="Configuração de cobranças" active={initialSection} links={[
                { key: "definitions", label: "Definições de cobrança", href: "?tab=definitions" },
                { key: "cycles", label: "Ciclos de cobrança", href: "?tab=cycles" },
            ]} />
            {initialSection === "definitions" ? <section id="definitions">
                {hasPermission(permissions, "BILLING", "CHARGE_DEFINITION_READ") ? <ChargeDefinitions /> : (
                    <div className="rounded-xl border border-input-border bg-j-white p-4">
                        <h2 className="font-bold text-primary">Definições de cobrança</h2>
                        <p className="mt-1 text-sm text-secondary">Você não tem permissão para consultar as definições.</p>
                    </div>
                )}
            </section> : <section id="cycles">
                {hasPermission(permissions, "BILLING", "CHARGE_CYCLE_READ") ? <BillingOperations resource="cycles" /> : (
                    <div className="rounded-xl border border-input-border bg-j-white p-4">
                        <h2 className="font-bold text-primary">Ciclos de cobrança</h2>
                        <p className="mt-1 text-sm text-secondary">Você não tem permissão para consultar os ciclos.</p>
                    </div>
                )}
            </section>}
        </FinancialPage>
    );
}
