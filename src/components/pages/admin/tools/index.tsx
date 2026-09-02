'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Wrench, Search, Eye, Pencil, Trash2, Power, ChevronLeft, ChevronRight } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { PageHeader } from "@/components/common/page-header";
import { Button, ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { listAdminToolsAction } from "@/actions/admin/tools/list";
import { ViewAdminToolModal } from "./ViewAdminToolModal";
import { EditAdminToolModal } from "./EditAdminToolModal";
import { ToggleAdminToolStatusModal } from "./ToggleAdminToolStatusModal";
import { DeleteAdminToolModal } from "./DeleteAdminToolModal";

const STATUS_OPTIONS: { label: string; value: ToolStatus | "" }[] = [
    { label: "Todos os status", value: "" },
    { label: "Ativa", value: "ACTIVE" },
    { label: "Inativa", value: "INACTIVE" },
];

const STATUS_LABEL: Record<ToolStatus, string> = {
    ACTIVE: "Ativa",
    INACTIVE: "Inativa",
    DELETED: "Excluída",
};

const STATUS_BADGE_CLASS: Record<ToolStatus, string> = {
    ACTIVE: "bg-j-green-100 text-j-green-700",
    INACTIVE: "bg-j-gray-200 text-j-gray-600",
    DELETED: "bg-j-red-100 text-j-red-600",
};

const PAGE_SIZE = 12;

export default function AdminTools() {
    const permissions = useUserStore((state) => state.permissions);
    const canUpdate = hasPermission(permissions, "TOOLS", "TOOL_UPDATE");
    const canDelete = hasPermission(permissions, "TOOLS", "TOOL_DELETE");
    const canToggleStatus =
        hasPermission(permissions, "TOOLS", "TOOL_ACTIVATE") ||
        hasPermission(permissions, "TOOLS", "TOOL_DEACTIVATE");

    const { setContent, setOpen } = useModal();
    const [nameInput, setNameInput] = useState("");
    const [name, setName] = useState("");
    const [status, setStatus] = useState<ToolStatus | "">("");
    const [page, setPage] = useState(0);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["admin", "tools", "list", name, status, page],
        queryFn: () =>
            listAdminToolsAction({
                name: name || undefined,
                status: status || undefined,
                page,
                size: PAGE_SIZE,
            }),
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        setName(nameInput.trim());
    };

    const openView = (id: number) => { setContent(<ViewAdminToolModal toolId={id} />); setOpen(); };
    const openEdit = (id: number) => { setContent(<EditAdminToolModal toolId={id} />); setOpen(); };
    const openToggle = (tool: AdminToolListItem) => {
        setContent(
            <ToggleAdminToolStatusModal
                toolId={tool.id}
                toolName={tool.name}
                nextStatus={tool.status === "ACTIVE" ? "DEACTIVATE" : "ACTIVATE"}
            />
        );
        setOpen();
    };
    const openDelete = (tool: AdminToolListItem) => {
        setContent(<DeleteAdminToolModal toolId={tool.id} toolLabel={tool.name} />);
        setOpen();
    };

    return (
        <div className="min-h-full w-full p-3 md:p-4">
            <div className="flex w-full flex-col gap-4 pb-6">
                <PageHeader
                    title="Administração de ferramentas"
                    breadcrumbs={[
                        { label: "Início", href: "/feed" },
                        { label: "Gestão Administrativa", href: "/admin" },
                        { label: "Ferramentas" },
                    ]}
                />

                <section className="overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-j-gray-200 p-4 md:flex-row md:items-center md:justify-between md:px-6">
                        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                            <div className="relative flex-1 max-w-sm">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-j-gray-400" />
                                <input
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    placeholder="Buscar por nome..."
                                    className="w-full rounded-lg border-2 border-j-gray-200 bg-j-gray-100 py-2 pl-9 pr-3 text-sm text-j-gray-700 placeholder:text-j-gray-400 focus:bg-j-white"
                                />
                            </div>
                            <select
                                value={status}
                                onChange={(e) => { setStatus(e.target.value as ToolStatus | ""); setPage(0); }}
                                className="rounded-lg border-2 border-j-gray-200 bg-j-gray-100 px-3 py-2 text-sm text-j-gray-700"
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <Button type="submit">Buscar</Button>
                        </form>
                    </div>

                    {isLoading && (
                        <p className="p-6 text-sm text-j-gray-400">Carregando ferramentas...</p>
                    )}

                    {isError && (
                        <p className="p-6 text-sm text-red-600">Não foi possível carregar as ferramentas.</p>
                    )}

                    {!isLoading && !isError && data?.content.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-8 text-center min-h-72">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-j-gray-100 text-j-gray-400">
                                <Wrench size={31} />
                            </div>
                            <h3 className="text-lg font-black text-j-blue-800">Nenhuma ferramenta encontrada</h3>
                            <p className="mt-1 max-w-md text-sm text-j-gray-600">
                                Ajuste a busca ou o filtro de status para ver outros resultados.
                            </p>
                        </div>
                    )}

                    {!isLoading && !isError && data && data.content.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 md:p-6">
                                {data.content.map((tool) => (
                                    <article key={tool.id} className="rounded-xl border border-j-gray-200 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-j-blue-800 text-j-yellow-300">
                                                <Wrench size={21} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h3 className="truncate font-black text-j-blue-800">{tool.name}</h3>
                                                    <span className={twMerge("shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold", STATUS_BADGE_CLASS[tool.status])}>
                                                        {STATUS_LABEL[tool.status]}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs text-j-gray-500">Dono: usuário #{tool.userId}</p>
                                            </div>
                                        </div>

                                        <div className="mt-3 grid grid-cols-1 gap-0.5 border-t border-j-gray-100 pt-3 sm:grid-cols-2">
                                            {canUpdate && (
                                                <button type="button" onClick={() => openEdit(tool.id)}
                                                    className="flex items-center gap-2.5 rounded-lg bg-yellow-50 px-2.5 py-2 text-left text-sm font-bold text-j-gray-700 hover:bg-yellow-100">
                                                    <Pencil size={16} className="text-yellow-500" /> Editar
                                                </button>
                                            )}
                                            <button type="button" onClick={() => openView(tool.id)}
                                                className="flex items-center gap-2.5 rounded-lg bg-blue-50 px-2.5 py-2 text-left text-sm font-bold text-j-gray-700 hover:bg-blue-100">
                                                <Eye size={16} className="text-j-blue-800" /> Visualizar
                                            </button>
                                            {canToggleStatus && (
                                                <button type="button" onClick={() => openToggle(tool)}
                                                    className="flex items-center gap-2.5 rounded-lg bg-purple-50 px-2.5 py-2 text-left text-sm font-bold text-j-gray-700 hover:bg-purple-100">
                                                    <Power size={16} className="text-purple-500" />
                                                    {tool.status === "ACTIVE" ? "Desativar" : "Ativar"}
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button type="button" onClick={() => openDelete(tool)}
                                                    className="flex items-center gap-2.5 rounded-lg bg-red-50 px-2.5 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-100">
                                                    <Trash2 size={16} /> Excluir
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {data.totalPages > 1 && (
                                <div className="flex items-center justify-center gap-4 border-t border-j-gray-100 p-4">
                                    <ButtonIcon disabled={data.first} onClick={() => setPage((p) => Math.max(p - 1, 0))} className="disabled:opacity-30">
                                        <ChevronLeft size={18} />
                                    </ButtonIcon>
                                    <span className="text-xs text-j-gray-400">Página {data.number + 1} de {data.totalPages}</span>
                                    <ButtonIcon disabled={data.last} onClick={() => setPage((p) => p + 1)} className="disabled:opacity-30">
                                        <ChevronRight size={18} />
                                    </ButtonIcon>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}