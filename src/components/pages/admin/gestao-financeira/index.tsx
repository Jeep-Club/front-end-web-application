"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Archive,CalendarPlus,Eye,Pencil,Plus,Power,PowerOff,ShieldX,Users } from "lucide-react";
import { useMemo,useState } from "react";
import { twMerge } from "tailwind-merge";

import { Button,ButtonIcon } from "@/components/common/button";
import { PageHeader } from "@/components/common/page-header";
import { Table } from "@/components/common/table";
import { ManagementBackButton } from "@/components/pages/admin/ManagementBackButton";
import { useModal } from "@/providers/ModalProvider";
import type { BillingResource } from "@/schemas/billing/management";
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
import { FinancialDashboard,type FinancialTab } from "./FinancialDashboard";
import { GenerateChargeCycleModal } from "./GenerateChargeCycleModal";
import { ToggleChargeDefinitionStatusModal } from "./ToggleChargeDefinitionStatusModal";

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

    const { data, isLoading, isFetching, error } = useQuery({
        queryKey: ["billing", "charge-definitions", searchParams],
        queryFn: () => listChargeDefinitionsAction(searchParams),
        placeholderData: (previous) => previous,
        enabled: canRead,
    });

    function handleSortChange(field: string) {
        const [currentField, currentDirection] = sort?.split(",") ?? [];
        const normalizedDirection = currentDirection?.toLowerCase();
        const nextSort = currentField !== field
            ? `${field},asc`
            : normalizedDirection === "asc"
                ? `${field},desc`
                : undefined;

        setSort(nextSort);
        setPage(0);
    }

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

    const columns = useMemo<ColumnDef<ChargeDefinitionSummary, unknown>[]>(() => [
        {
            accessorKey: "name",
            header: () => (
                <Table.Sortable field="name" label="Nome" sort={sort} onSortChange={handleSortChange} />
            ),
            meta: { label: "Nome" },
            cell: ({ row }) => (
                <span className="font-bold text-j-gray-700">{row.original.name}</span>
            ),
        },
        {
            accessorKey: "defaultAmount",
            header: () => (
                <Table.Sortable field="defaultAmount" label="Valor padrão" sort={sort} onSortChange={handleSortChange} />
            ),
            meta: { label: "Valor padrão" },
            cell: ({ row }) => formatCurrencyBRL(row.original.defaultAmount),
        },
        {
            accessorKey: "recurrenceType",
            header: "Recorrência",
            meta: { label: "Recorrência" },
            cell: ({ row }) => CHARGE_RECURRENCE_LABEL[row.original.recurrenceType],
        },
        {
            accessorKey: "required",
            header: "Obrigatória",
            meta: { label: "Obrigatória" },
            cell: ({ row }) => (
                <span className="font-bold text-j-gray-700">
                    {row.original.required ? "Sim" : "Não"}
                </span>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            meta: { label: "Status" },
            cell: ({ row }) => (
                <span
                    className={twMerge(
                        "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                        CHARGE_DEFINITION_STATUS_STYLE[row.original.status],
                    )}
                >
                    {CHARGE_DEFINITION_STATUS_LABEL[row.original.status]}
                </span>
            ),
        },
        {
            id: "actions",
            header: "Ações",
            meta: { label: "Ações" },
            cell: ({ row }) => {
                const definition = row.original;
                const isArchived = definition.status === "ARCHIVED";

                return (
                    <div className="flex items-center justify-end gap-1.5">
                        <ButtonIcon type="button" title="Ver detalhes" aria-label={`Ver detalhes de ${definition.name}`} onClick={() => { setContent(<ChargeDefinitionDetailsModal id={definition.id} />); setOpen(); }} className="rounded-lg bg-j-gray-100 p-2 text-j-blue-800"><Eye size={18} /></ButtonIcon>
                        {canReadAssignments && (
                            <ButtonIcon
                                type="button"
                                title="Ver atribuições"
                                aria-label={`Ver atribuições de ${definition.name}`}
                                onClick={() => handleOpenAssignments(definition)}
                                className="rounded-lg bg-j-blue-800 p-2 text-j-yellow-300 hover:bg-j-blue-600 hover:text-j-yellow-300"
                            >
                                <Users size={18} />
                            </ButtonIcon>
                        )}

                        {canGenerate && definition.status === "ACTIVE" && (
                            <ButtonIcon
                                type="button"
                                title="Gerar cobrança"
                                aria-label={`Gerar cobrança de ${definition.name}`}
                                onClick={() => handleOpenGenerateCycle(definition)}
                                className="rounded-lg bg-j-green-100 p-2 text-j-green-700 hover:bg-j-green-200"
                            >
                                <CalendarPlus size={18} />
                            </ButtonIcon>
                        )}

                        {canUpdate && !isArchived && (
                            <ButtonIcon
                                type="button"
                                title={definition.status === "ACTIVE" ? "Desativar" : "Ativar"}
                                aria-label={`${definition.status === "ACTIVE" ? "Desativar" : "Ativar"} ${definition.name}`}
                                onClick={() => handleOpenToggleStatus(definition)}
                                className={twMerge(
                                    "rounded-lg p-2",
                                    definition.status === "ACTIVE"
                                        ? "bg-red-50 text-red-500 hover:bg-red-100"
                                        : "bg-green-50 text-j-green-600 hover:bg-green-100",
                                )}
                            >
                                {definition.status === "ACTIVE" ? <PowerOff size={18} /> : <Power size={18} />}
                            </ButtonIcon>
                        )}

                        {canUpdate && !isArchived && (
                            <ButtonIcon
                                type="button"
                                title="Editar"
                                aria-label={`Editar ${definition.name}`}
                                onClick={() => handleOpenEdit(definition.id)}
                                className="rounded-lg bg-yellow-50 p-2 text-yellow-600 hover:bg-yellow-100"
                            >
                                <Pencil size={18} />
                            </ButtonIcon>
                        )}

                        {canUpdate && !isArchived && (
                            <ButtonIcon
                                type="button"
                                title="Arquivar"
                                aria-label={`Arquivar ${definition.name}`}
                                onClick={() => handleOpenArchive(definition)}
                                className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100"
                            >
                                <Archive size={18} />
                            </ButtonIcon>
                        )}
                    </div>
                );
            },
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [sort, canGenerate, canUpdate, canReadAssignments]);

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
                        columns={columns}
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
                        error={error ? error.message : undefined}
                        emptyState="Nenhuma definição de cobrança cadastrada."
                    >
                        <Table.Header
                            title="Definições de cobrança"
                        >
                            {canExport && <BillingExport kind="definitions" />}
                            {canCreate && (
                                <Button type="button" onClick={handleOpenCreate} className="h-10 w-full shrink-0 px-4 py-0 text-sm sm:w-auto">
                                    <Plus size={16} strokeWidth={3} />
                                    Criar definição
                                </Button>
                            )}
                        </Table.Header>

                        <Table.Content loadingRows={pageSize} />
                    </Table.Root>
                )}
            </div>
        </div>
    );
}

export default function FinancialManagement() {
    const permissions = useUserStore((state) => state.permissions);
    const tabs: { key: "definitions" | BillingResource; title: string; permission: string }[] = [
        { key: "definitions", title: "Definições e atribuições", permission: "CHARGE_DEFINITION_READ" },
        { key: "cycles", title: "Ciclos", permission: "CHARGE_CYCLE_READ" },
        { key: "member-charges", title: "Cobranças", permission: "MEMBER_CHARGE_READ" },
        { key: "payments", title: "Pagamentos", permission: "PAYMENT_READ" },
        { key: "refunds", title: "Reembolsos", permission: "REFUND_READ" },
    ];
    const visibleTabs = tabs.filter((tab) => hasPermission(permissions, "BILLING", tab.permission));
    const [selected, setSelected] = useState<FinancialTab>("dashboard");
    const active = visibleTabs.length ? selected === "dashboard" ? "dashboard" : visibleTabs.find((tab) => tab.key === selected)?.key ?? "dashboard" : undefined;
    const breadcrumbLabels: Record<FinancialTab, string> = {
        dashboard: "Dashboard",
        definitions: "Definições de cobrança",
        cycles: "Ciclos de cobrança",
        "member-charges": "Cobranças",
        payments: "Pagamentos",
        refunds: "Reembolsos",
    };
    return <div className="min-h-full w-full p-3 md:p-4"><div className="flex flex-col gap-4 pb-6">
        <PageHeader title="Gestão financeira" breadcrumbs={[{ label: "Home", href: "/feed" }, { label: "Gestão Administrativa", href: "/admin" }, { label: "Gestão financeira", ...(active ? { href: "/admin/gestao-financeira" } : {}) }, ...(active ? [{ label: breadcrumbLabels[active] }] : [])]} />
        <div className="flex flex-wrap items-center gap-3"><ManagementBackButton /><p className="text-sm text-j-gray-600">Configure cobranças, acompanhe os ciclos e gerencie pagamentos e reembolsos dos associados.</p></div>
        <nav aria-label="Áreas da gestão financeira" className="grid w-full grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-[repeat(var(--financial-tab-count),minmax(0,1fr))]" style={{ "--financial-tab-count": visibleTabs.length + 1 } as React.CSSProperties}>{(visibleTabs.length ? [{ key: "dashboard" as const, title: "Dashboard" }, ...visibleTabs] : []).map((tab) => <button key={tab.key} aria-current={active === tab.key ? "page" : undefined} onClick={() => setSelected(tab.key)} className={twMerge("flex min-h-14 w-full min-w-0 items-center justify-center rounded-xl border border-j-gray-200 bg-j-white px-3 py-3 text-center text-sm font-bold leading-tight text-j-blue-800", active === tab.key && "border-j-blue-800 bg-j-blue-800 text-j-yellow-300")}>{tab.title}</button>)}</nav>
        {!active ? <p className="rounded-xl bg-j-white p-6">Seu usuário não possui permissão para consultar a gestão financeira.</p> : active === "dashboard" ? <FinancialDashboard onNavigate={setSelected} /> : active === "definitions" ? <ChargeDefinitions /> : <BillingOperations key={active} resource={active} />}
    </div></div>;
}
