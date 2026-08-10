'use client';

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Wrench, Plus, Eye, Pencil, Trash2, Power, PowerOff } from "lucide-react";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import { Button, ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { listToolsAction } from "@/actions/tools/list";
import { activateToolAction } from "@/actions/tools/activate";
import { deactivateToolAction } from "@/actions/tools/deactivate";
import { IncludeToolModal } from "./IncludeToolModal";
import { ViewToolModal } from "./ViewToolModal";
import { DeleteToolModal } from "./DeleteToolModal";

const PAGE_SIZE = 10;

const STATUS_LABELS: Record<ToolStatus, string> = {
    ACTIVE: "Ativa",
    INACTIVE: "Inativa",
    DELETED: "Excluída",
};

const STATUS_CLASSES: Record<ToolStatus, string> = {
    ACTIVE: "bg-j-green-100 text-j-green-700",
    INACTIVE: "bg-j-gray-200 text-j-gray-600",
    DELETED: "bg-j-red-100 text-j-red-600",
};

export function ToolsTabContent() {
    const { setContent, setOpen } = useModal();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["tools", "list", page],
        queryFn: () => listToolsAction({ page, size: PAGE_SIZE }),
    });

    const toggleStatusMutation = useMutation({
        mutationFn: (tool: ToolListItem) =>
            tool.status === "ACTIVE"
                ? deactivateToolAction(tool.id)
                : activateToolAction(tool.id),
        onSuccess: () => {
            toast.success("Status atualizado com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["tools", "list"] });
        },
        onError: (error) => toast.error(error.message || "Erro ao atualizar status."),
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
                                className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-j-blue-800 text-j-yellow-300">
                                        <Wrench size={18} />
                                    </span>
                                    <span className={twMerge(
                                        "rounded-full px-2.5 py-1 text-[11px] font-bold",
                                        STATUS_CLASSES[tool.status],
                                    )}>
                                        {STATUS_LABELS[tool.status]}
                                    </span>
                                </div>

                                <p className="truncate text-sm font-bold text-j-gray-700">{tool.name}</p>

                                <div className="mt-auto flex items-center gap-1 border-t border-j-gray-100 pt-3">
                                    <ButtonIcon title="Ver detalhes" onClick={() => handleOpenView(tool.id)}>
                                        <Eye size={16} />
                                    </ButtonIcon>
                                    <ButtonIcon title="Editar" onClick={() => handleOpenEdit(tool.id)}>
                                        <Pencil size={16} />
                                    </ButtonIcon>
                                    <ButtonIcon
                                        title={tool.status === "ACTIVE" ? "Desativar" : "Ativar"}
                                        onClick={() => toggleStatusMutation.mutate(tool)}
                                        disabled={toggleStatusMutation.isPending}
                                    >
                                        {tool.status === "ACTIVE" ? <PowerOff size={16} /> : <Power size={16} />}
                                    </ButtonIcon>
                                    <ButtonIcon title="Excluir" onClick={() => handleOpenDelete(tool)}>
                                        <Trash2 size={16} />
                                    </ButtonIcon>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <Button
                            type="button"
                            disabled={data.first}
                            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                        >
                            Anterior
                        </Button>
                        <span className="text-xs text-j-gray-400">
                            Página {data.number + 1} de {Math.max(data.totalPages, 1)}
                        </span>
                        <Button
                            type="button"
                            disabled={data.last}
                            onClick={() => setPage((prev) => prev + 1)}
                        >
                            Próxima
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}

export default ToolsTabContent;