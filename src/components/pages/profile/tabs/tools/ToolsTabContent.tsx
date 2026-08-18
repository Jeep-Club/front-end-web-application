'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Wrench, Plus, ChevronLeft, ChevronRight, Eye, Pencil, Trash2, Power } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Button, ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { listToolsAction } from "@/actions/tools/list";
import { IncludeToolModal } from "./IncludeToolModal";
import { ViewToolModal } from "./ViewToolModal";
import { DeleteToolModal } from "./DeleteToolModal";
import { ToggleToolStatusModal } from "./ToggleToolStatusModal";

const PAGE_SIZE = 10;

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

export function ToolsTabContent() {
    const { setContent, setOpen } = useModal();
    const [page, setPage] = useState(0);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["tools", "list", page],
        queryFn: () => listToolsAction({ page, size: PAGE_SIZE }),
    });

    const handleOpenInclude = () => {
        setContent(<IncludeToolModal />);
        setOpen();
    };

    const handleOpenEdit = (toolId: number) => {
        setContent(<IncludeToolModal toolId={toolId} />);
        setOpen();
    };

    const handleOpenView = (toolId: number) => {
        setContent(<ViewToolModal toolId={toolId} />);
        setOpen();
    };

    const handleOpenDelete = (tool: ToolListItem) => {
        setContent(<DeleteToolModal toolId={tool.id} toolLabel={tool.name} />);
        setOpen();
    };

    const handleOpenToggleStatus = (tool: ToolListItem) => {
        setContent(
            <ToggleToolStatusModal
                toolId={tool.id}
                toolName={tool.name}
                nextStatus={tool.status === "ACTIVE" ? "DEACTIVATE" : "ACTIVATE"}
            />
        );
        setOpen();
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-j-gray-700">Minhas ferramentas</h3>
                <Button onClick={handleOpenInclude}>
                    <Plus size={16} />
                    <span className="hidden sm:inline">Incluir Ferramenta</span>
                    <span className="sm:hidden">Incluir</span>
                </Button>
            </div>

            {isLoading && (
                <p className="text-sm text-j-gray-400">Carregando ferramentas...</p>
            )}

            {isError && (
                <p className="text-sm text-j-red-400">Não foi possível carregar suas ferramentas.</p>
            )}

            {!isLoading && !isError && data?.content.length === 0 && (
                <p className="text-sm text-j-gray-400">Você ainda não tem nenhuma ferramenta cadastrada.</p>
            )}

            {!isLoading && !isError && data && data.content.length > 0 && (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {data.content.map((tool) => (
                            <div
                                key={tool.id}
                                className="flex flex-col overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm"
                            >
                                <div className="flex flex-1 flex-col gap-3 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-j-blue-800 text-j-yellow-300">
                                            <Wrench size={20} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h4 className="truncate font-black text-j-blue-800">
                                                {tool.name}
                                            </h4>
                                            <span className={twMerge(
                                                "mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                                                STATUS_BADGE_CLASS[tool.status],
                                            )}>
                                                {STATUS_LABEL[tool.status]}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-1 grid grid-cols-1 gap-2 border-t border-j-gray-100 pt-3">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEdit(tool.id)}
                                            className="flex items-center gap-2.5 rounded-lg bg-yellow-50 px-2.5 py-2 text-left text-sm font-bold text-j-gray-700 transition-colors hover:bg-yellow-100"
                                        >
                                            <Pencil size={16} className="text-yellow-500" />
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenView(tool.id)}
                                            className="flex items-center gap-2.5 rounded-lg bg-blue-50 px-2.5 py-2 text-left text-sm font-bold text-j-gray-700 transition-colors hover:bg-blue-100"
                                        >
                                            <Eye size={16} className="text-j-blue-800" />
                                            Visualizar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenToggleStatus(tool)}
                                            className="flex items-center gap-2.5 rounded-lg bg-purple-50 px-2.5 py-2 text-left text-sm font-bold text-j-gray-700 transition-colors hover:bg-purple-100"
                                        >
                                            <Power size={16} className="text-purple-500" />
                                            {tool.status === "ACTIVE" ? "Desativar" : "Ativar"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenDelete(tool)}
                                            className="flex items-center gap-2.5 rounded-lg bg-red-50 px-2.5 py-2 text-left text-sm font-bold text-red-500 transition-colors hover:bg-red-100"
                                        >
                                            <Trash2 size={16} />
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {data.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 pt-2">
                            <ButtonIcon
                                disabled={data.first}
                                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                                className="text-j-gray-600 disabled:flex disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                <ChevronLeft size={18} />
                            </ButtonIcon>
                            <span className="text-xs text-j-gray-400">
                                Página {data.number + 1} de {data.totalPages}
                            </span>
                            <ButtonIcon
                                disabled={data.last}
                                onClick={() => setPage((prev) => prev + 1)}
                                className="text-j-gray-600 disabled:flex disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                <ChevronRight size={18} />
                            </ButtonIcon>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default ToolsTabContent;