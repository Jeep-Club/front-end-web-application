"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, HeartPulse, Pencil, Plus, ShieldX, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/common/page-header";
import { ManagementBackButton } from "@/components/pages/admin/ManagementBackButton";
import { Button } from "@/components/common/button";
import { Table } from "@/components/common/table";
import { useModal } from "@/providers/ModalProvider";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { medicalPermissions as permissionsConfig } from "@/config/medicalPermissions";
import MedicalDetails from "./MedicalDetails";
import { listMedicalProfilesAction, getMedicalProfileAdminAction, getMedicalOwnerAction, deleteMedicalProfileAction, exportMedicalProfilesAction } from "@/server/actions/admin/medical-profile/manage";
import MedicalForm from "./MedicalForm";

const key = ["admin", "medical-profiles"];
const date = (value: string) => new Date(value).toLocaleString("pt-BR");
const owner = (profile: MedicalProfileSummary) => `${profile.ownerType === "DEPENDENT" ? "Dependente" : "Usuário"} #${profile.ownerId}`;

function ExportButtons({ profileId }: { profileId?: number }) {
    const permissions = useUserStore(state => state.permissions);
    const [history, setHistory] = useState(false);
    const download = useMutation({
        mutationFn: async (format: "CSV" | "PDF") => {
            const file = await exportMedicalProfilesAction(format, profileId, history);
            const bytes = Uint8Array.from(atob(file.base64), char => char.charCodeAt(0));
            const url = URL.createObjectURL(new Blob([bytes], { type: file.contentType }));
            const link = document.createElement("a");
            link.href = url; link.download = file.filename;
            document.body.appendChild(link); link.click(); link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
        onError: error => toast.error(error.message),
    });
    if (!hasPermission(permissions, permissionsConfig.module, permissionsConfig.export)) return null;
    return <div className="flex flex-wrap items-center gap-2">
        {!profileId && <label className="flex items-center gap-2 text-sm text-j-gray-600"><input type="checkbox" checked={history} disabled={download.isPending} onChange={event => setHistory(event.target.checked)} />Histórico de exclusões</label>}
        {(["CSV", "PDF"] as const).map(format => <Button key={format} disabled={download.isPending} onClick={() => download.mutate(format)} className="h-10 px-3 py-0 text-sm">{download.isPending ? "Exportando..." : `Exportar ${format}`}</Button>)}
    </div>;
}

function ProfileModal({ id, mode, onClose }: { id?: number; mode: "view" | "edit" | "create" | "delete"; onClose: () => void }) {
    const permissions = useUserStore(state => state.permissions);
    const canRead = hasPermission(permissions, "HEALTH", permissionsConfig.read);
    const canUpdate = hasPermission(permissions, "HEALTH", permissionsConfig.update);
    const canDelete = hasPermission(permissions, "HEALTH", permissionsConfig.delete);
    const client = useQueryClient();
    const detail = useQuery({ queryKey: [...key, "detail", id], queryFn: () => getMedicalProfileAdminAction(id!), enabled: canRead && !!id && mode !== "delete", gcTime: 0 });
    const ownerInfo = useQuery({ queryKey: [...key, "owner", id], queryFn: () => getMedicalOwnerAction(id!), enabled: canRead && !!id && mode === "view", gcTime: 0 });
    const deletion = useMutation({ mutationFn: () => deleteMedicalProfileAction(id!), onSuccess: async () => {
        client.removeQueries({ queryKey: [...key, "detail", id] });
        await client.invalidateQueries({ queryKey: key });
        toast.success("Perfil médico excluído."); onClose();
    }, onError: error => toast.error(error.message) });
    const title = { view: "Dados médicos", edit: "Editar dados médicos", create: "Cadastrar dados médicos", delete: "Excluir perfil médico" }[mode];
    return <div role="dialog" aria-modal="true" aria-labelledby="medical-modal-title" className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-j-gray-200 bg-white p-5 shadow-2xl md:p-8">
        <header className="mb-5 flex items-center justify-between gap-3 border-b border-j-gray-200 pb-5"><div className="flex items-center gap-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300 shadow-sm"><HeartPulse size={23} aria-hidden="true" /></span><h2 id="medical-modal-title" className="text-xl font-extrabold text-j-blue-800">{title}</h2></div><button type="button" aria-label="Fechar" disabled={deletion.isPending} onClick={onClose} className="shrink-0 rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200"><X size={20} /></button></header>
        {!canRead ? <p>Acesso não permitido.</p> : mode === "delete" ? canDelete ? <div className="flex flex-col gap-4"><p className="text-sm text-j-gray-600">Deseja excluir o perfil médico #{id}? O histórico será preservado pelo sistema.</p><div className="flex justify-end gap-2"><Button disabled={deletion.isPending} onClick={onClose} className="bg-j-gray-100 text-j-blue-800">Cancelar</Button><Button disabled={deletion.isPending} onClick={() => deletion.mutate()} className="bg-red-600 text-white hover:bg-red-700">{deletion.isPending ? "Excluindo..." : "Confirmar exclusão"}</Button></div></div> : <p>Acesso não permitido.</p>
            : mode === "create" ? canUpdate ? <MedicalForm medicalProfile={null} onSaved={onClose} /> : <p>Acesso não permitido.</p>
            : detail.isPending ? <p role="status">Carregando dados médicos...</p>
            : detail.error ? <div role="alert"><p>{detail.error.message}</p><Button onClick={() => void detail.refetch()}>Tentar novamente</Button></div>
            : detail.data && (mode === "edit" ? canUpdate ? <MedicalForm medicalProfile={detail.data} onSaved={onClose} /> : <p>Acesso não permitido.</p> : <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-extrabold text-j-blue-800"># {detail.data.ownerType === "DEPENDENT" ? "Dependente" : "Associado"} {ownerInfo.data?.name ?? (ownerInfo.isPending ? "— carregando nome..." : `#${detail.data.ownerId}`)}</h3>
                    {detail.data.ownerType === "DEPENDENT" && <p className="text-sm text-j-gray-500">Associado responsável: <span className="font-semibold text-j-gray-700">{ownerInfo.data?.responsibleName ?? (ownerInfo.isPending ? "Carregando..." : "Nome indisponível")}</span></p>}
                    {ownerInfo.isError && <button type="button" onClick={() => void ownerInfo.refetch()} className="self-start text-xs font-bold text-j-blue-700 hover:underline">Tentar carregar nomes novamente</button>}
                </div>
                <MedicalDetails profile={detail.data} />
                <footer className="flex flex-col gap-4 border-t border-j-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-j-gray-500">{`Atualizado em ${date(detail.data.updatedAt)}`}</p>
                    <ExportButtons profileId={id} />
                </footer>
            </div>)}
    </div>;
}

export default function MedicalManagement() {
    const permissions = useUserStore(state => state.permissions);
    const can = (action: string) => hasPermission(permissions, permissionsConfig.module, action);
    const canRead = can(permissionsConfig.read);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const { setContent, setOpen, setClose } = useModal();
    const query = useQuery({ queryKey: [...key, "list", pagination, permissions], queryFn: () => listMedicalProfilesAction(pagination.pageIndex, pagination.pageSize), enabled: canRead, gcTime: 0 });
    function open(mode: "view" | "edit" | "create" | "delete", id?: number) {
        setContent(<ProfileModal key={`${mode}-${id}`} mode={mode} id={id} onClose={setClose} />); setOpen();
    }
    const columns: ColumnDef<MedicalProfileSummary, unknown>[] = [
        { accessorKey: "id", header: "Perfil", meta: { label: "Perfil" }, cell: ({ row }) => <span className="font-bold text-j-blue-800">#{row.original.id}</span> },
        { id: "owner", header: "Titular", meta: { label: "Titular" }, cell: ({ row }) => owner(row.original) },
        { accessorKey: "updatedAt", header: "Atualizado em", meta: { label: "Atualizado em" }, cell: ({ row }) => date(row.original.updatedAt) },
        { id: "actions", header: "Ações", meta: { label: "Ações" }, cell: ({ row }) => <div className="flex flex-wrap justify-end gap-2">
            <button type="button" aria-label={`Visualizar perfil ${row.original.id}`} onClick={() => open("view", row.original.id)} className="flex min-h-9 items-center gap-1.5 rounded-lg bg-blue-50 px-3 text-xs font-bold text-j-blue-700 hover:bg-blue-100"><Eye size={15} />Visualizar</button>
            {can(permissionsConfig.update) && <button type="button" aria-label={`Editar perfil ${row.original.id}`} onClick={() => open("edit", row.original.id)} className="flex min-h-9 items-center gap-1.5 rounded-lg bg-yellow-50 px-3 text-xs font-bold text-j-gray-700 hover:bg-yellow-100"><Pencil size={15} />Editar</button>}
            {can(permissionsConfig.delete) && <button type="button" aria-label={`Excluir perfil ${row.original.id}`} onClick={() => open("delete", row.original.id)} className="flex min-h-9 items-center gap-1.5 rounded-lg bg-red-50 px-3 text-xs font-bold text-red-500 hover:bg-red-100"><Trash2 size={15} />Excluir</button>}
        </div> },
    ];
    return <div className="min-h-full w-full p-3 md:p-4"><div className="flex w-full flex-col gap-4 pb-6">
        <PageHeader title="Gestão de dados médicos" breadcrumbs={[{ label: "Home", href: "/feed" }, { label: "Gestão Administrativa", href: "/admin" }, { label: "Dados médicos" }]} />
        {!canRead ? <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-j-gray-300 bg-j-white p-6 text-center"><ShieldX size={42} className="mb-3 text-j-gray-400" /><h3 className="text-lg font-black text-j-blue-800">Acesso não permitido</h3><p className="mt-1 text-sm text-j-gray-600">Seu usuário não possui permissão para consultar dados médicos.</p></section> : <>
            <div className="flex items-center gap-3"><ManagementBackButton /><p className="text-sm text-j-gray-600">Gerencie os perfis médicos de usuários e dependentes ativos.</p></div>
            <Table.Root data={query.data?.content ?? []} columns={columns} getRowId={profile => String(profile.id)} isLoading={query.isPending} isFetching={query.isFetching} error={query.error ? <div className="flex flex-col gap-3"><p>{query.error.message}</p><Button onClick={() => void query.refetch()}>Tentar novamente</Button></div> : undefined} emptyState="Nenhum perfil médico cadastrado." pagination={{ ...pagination, pageCount: query.data?.totalPages ?? 0, rowCount: query.data?.totalElements, pageSizeOptions: [10, 20, 50], onChange: next => setPagination({ ...next, pageIndex: next.pageSize !== pagination.pageSize ? 0 : next.pageIndex }) }} footer={<Table.Pagination itemLabel="perfil médico" />}>
                <Table.Header title="Perfis médicos" description="Abra um perfil para consultar os dados completos."><ExportButtons />{can(permissionsConfig.update) && <Button onClick={() => open("create")} className="h-10 gap-2 px-4 py-0 text-sm"><Plus size={16} />Cadastrar perfil</Button>}</Table.Header>
                <Table.Content loadingRows={pagination.pageSize} />
            </Table.Root>
        </>}
    </div></div>;
}
