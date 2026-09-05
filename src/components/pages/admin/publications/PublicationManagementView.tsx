"use client";
import { useMemo } from "react";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Button, ButtonIcon } from "@/components/common/button";
import { Select } from "@/components/common/select";
import { Table } from "@/components/common/table";
import { formatPublicationDate, PUBLICATION_STATUS_LABEL, PUBLICATION_STATUS_STYLE, PUBLICATION_TYPE_LABEL, PUBLICATION_TYPE_STYLE } from "./publication-display";

interface Props {
    publications: Publication[]; query: PublicationSearchParams; totalItems: number; totalPages: number; pageIndex: number; pageSize: number; isFetching: boolean;
    onSearch: (value: string) => void; onFilter: (patch: Partial<PublicationSearchParams>) => void; onClear: () => void;
    onPagination: (value: PaginationState) => void; onSort: (field: string) => void; onCreate: () => void;
    onView: (item: Publication) => void; onEdit: (item: Publication) => void; onDelete: (item: Publication) => void;
}
const filterClass = "h-10 border border-j-gray-200 bg-j-gray-100 py-2 text-sm text-j-gray-700";

export function PublicationManagementView(props: Props) {
    const hasFilters = Boolean(props.query.q || props.query.title || props.query.type || props.query.status || props.query.noticePriority || props.query.serviceCategory || props.query.createdFrom || props.query.createdTo || props.query.publishedFrom || props.query.publishedTo);
    const columns = useMemo<ColumnDef<Publication, unknown>[]>(() => [
        { accessorKey: "id", header: "ID", meta: { label: "ID" }, cell: ({ row }) => <span className="font-bold text-j-gray-700">{row.original.id.toString()}</span> },
        { accessorKey: "title", header: () => <Table.Sortable field="title" label="Título" sort={props.query.sort} onSortChange={props.onSort} />, meta: { label: "Título" }, cell: ({ row }) => <span className="font-bold text-j-gray-700">{row.original.title}</span> },
        { accessorKey: "type", header: () => <Table.Sortable field="type" label="Tipo" sort={props.query.sort} onSortChange={props.onSort} />, meta: { label: "Tipo" }, cell: ({ row }) => <span className={twMerge("inline-flex rounded-full px-2.5 py-1 text-xs font-bold", PUBLICATION_TYPE_STYLE[row.original.type])}>{PUBLICATION_TYPE_LABEL[row.original.type]}</span> },
        { accessorKey: "status", header: () => <Table.Sortable field="status" label="Status" sort={props.query.sort} onSortChange={props.onSort} />, meta: { label: "Status" }, cell: ({ row }) => <span className={twMerge("inline-flex rounded-full px-2.5 py-1 text-xs font-bold", PUBLICATION_STATUS_STYLE[row.original.status])}>{PUBLICATION_STATUS_LABEL[row.original.status]}</span> },
        { id: "mainDate", header: "Data principal", meta: { label: "Data principal" }, cell: ({ row }) => formatPublicationDate(row.original.type === "event" ? row.original.startAt : row.original.type === "notice" ? row.original.expiresAt : row.original.publishedAt) },
        { accessorKey: "createdAt", header: () => <Table.Sortable field="createdAt" label="Criação" sort={props.query.sort} onSortChange={props.onSort} />, meta: { label: "Criação" }, cell: ({ row }) => formatPublicationDate(row.original.createdAt) },
        { id: "actions", header: "Ações", meta: { label: "Ações" }, cell: ({ row }) => <div className="flex gap-1"><ButtonIcon title="Visualizar" aria-label={`Visualizar ${row.original.title}`} onClick={() => props.onView(row.original)} className="p-2 text-j-blue-700"><Eye size={17} /></ButtonIcon><ButtonIcon title="Editar" aria-label={`Editar ${row.original.title}`} onClick={() => props.onEdit(row.original)} className="p-2 text-j-blue-700"><Pencil size={17} /></ButtonIcon><ButtonIcon title="Excluir" aria-label={`Excluir ${row.original.title}`} onClick={() => props.onDelete(row.original)} className="p-2 text-j-red-500"><Trash2 size={17} /></ButtonIcon></div> },
    ], [props]);
    return <Table.Root columns={columns} data={props.publications} getRowId={(item) => item.id.toString()} isFetching={props.isFetching} emptyState={hasFilters ? "Nenhuma publicação encontrada para os filtros atuais." : "Nenhuma publicação cadastrada."} pagination={{ pageIndex: props.pageIndex, pageSize: props.pageSize, pageCount: props.totalPages, rowCount: props.totalItems, onChange: props.onPagination }} footer={<Table.Pagination itemLabel="publicação" />}>
        <Table.Header title="Publicações" description="Gerencie eventos, avisos e serviços."><Table.Search value={props.query.q ?? ""} onValueChange={props.onSearch} placeholder="Buscar em todo o conteúdo..." /><Button onClick={props.onCreate} className="shrink-0"><Plus size={17} /> Nova publicação</Button></Table.Header>
        <div className="border-b border-j-gray-200 p-4 md:px-6"><Table.Filters onClear={props.onClear} hasActiveFilters={hasFilters} className="flex-wrap">
            <input aria-label="Buscar por título" placeholder="Título" value={props.query.title ?? ""} onChange={(e) => props.onFilter({ title: e.target.value || undefined })} className={`${filterClass} rounded-lg px-3`} />
            <Select name="type" label="Tipo" labelClassName="text-j-gray-700" value={props.query.type ?? ""} onChange={(e) => props.onFilter({ type: (e.target.value || undefined) as PublicationType | undefined })} className={filterClass}><option value="">Todos</option><option value="event">Evento</option><option value="notice">Aviso</option><option value="service">Serviço</option></Select>
            <Select name="status" label="Status" labelClassName="text-j-gray-700" value={props.query.status ?? ""} onChange={(e) => props.onFilter({ status: (e.target.value || undefined) as PublicationStatus | undefined })} className={filterClass}><option value="">Todos</option><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="archived">Arquivado</option></Select>
            <Select name="priority" label="Prioridade" labelClassName="text-j-gray-700" value={props.query.noticePriority ?? ""} onChange={(e) => props.onFilter({ noticePriority: (e.target.value || undefined) as NoticePriority | undefined })} className={filterClass}><option value="">Todas</option><option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option></Select>
            <Select name="category" label="Categoria" labelClassName="text-j-gray-700" value={props.query.serviceCategory ?? ""} onChange={(e) => props.onFilter({ serviceCategory: (e.target.value || undefined) as ServiceCategory | undefined })} className={filterClass}><option value="">Todas</option><option value="benefit">Benefício</option><option value="help">Ajuda</option><option value="general">Geral</option></Select>
            {(["createdFrom", "createdTo", "publishedFrom", "publishedTo"] as const).map((key) => <label key={key} className="text-xs font-bold text-j-gray-700">{{ createdFrom: "Criação de", createdTo: "Criação até", publishedFrom: "Publicação de", publishedTo: "Publicação até" }[key]}<input type="date" value={props.query[key] ?? ""} onChange={(e) => props.onFilter({ [key]: e.target.value || undefined })} className={`${filterClass} mt-2 block rounded-lg px-2`} /></label>)}
        </Table.Filters></div><Table.Content />
    </Table.Root>;
}

