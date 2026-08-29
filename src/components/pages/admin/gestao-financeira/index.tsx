"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Archive, Pencil, Plus, Power, PowerOff, ShieldX, Users } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { PageHeader } from "@/components/common/page-header";
import { Button, ButtonIcon } from "@/components/common/button";
import { Table } from "@/components/common/table";
import { useModal } from "@/providers/ModalProvider";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { listChargeDefinitionsAction } from "@/actions/billing/chargeDefinitions/list";
import { CreateChargeDefinitionModal } from "./CreateChargeDefinitionModal";
import { EditChargeDefinitionModal } from "./EditChargeDefinitionModal";
import { ToggleChargeDefinitionStatusModal } from "./ToggleChargeDefinitionStatusModal";
import { ArchiveChargeDefinitionModal } from "./ArchiveChargeDefinitionModal";
import { ChargeAssignmentsModal } from "./ChargeAssignmentsModal";
import {
    CHARGE_DEFINITION_STATUS_LABEL,
    CHARGE_DEFINITION_STATUS_STYLE,
    CHARGE_RECURRENCE_LABEL,
    formatCurrencyBRL,
} from "./chargeDefinitionDisplay";

const PAGE_SIZE = 10;

export default function FinancialManagement() {
    const { setContent, setOpen } = useModal();
    const permissions = useUserStore((state) => state.permissions);

    const canRead = hasPermission(permissions, "BILLING", "CHARGE_DEFINITION_READ");
    const canCreate = hasPermission(permissions, "BILLING", "CHARGE_DEFINITION_CREATE");
    const canUpdate = hasPermission(permissions, "BILLING", "CHARGE_DEFINITION_UPDATE");
    const canReadAssignments = hasPermission(permissions, "BILLING", "CHARGE_ASSIGNMENT_READ");

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

                        {canUpdate && (
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
    ], [sort, canUpdate, canReadAssignments]);

    return (
        <div className="min-h-full w-full p-3 md:p-4">
            <div className="flex w-full flex-col gap-4 pb-6">
                <PageHeader
                    title="Gestão financeira"
                    breadcrumbs={[
                        { label: "Início", href: "/feed" },
                        { label: "Gestão Administrativa", href: "/admin" },
                        { label: "Gestão financeira" },
                    ]}
                />

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
                            pageSizeOptions: [5, 10, 20, 50, 100],
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
                            description={isLoading ? "Carregando..." : `${data?.totalElements ?? 0} cadastrada(s)`}
                        >
                            {canCreate && (
                                <Button type="button" onClick={handleOpenCreate} className="w-full shrink-0 sm:w-auto">
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
