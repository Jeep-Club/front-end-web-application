'use client';

import { Button } from "@/components/common/button";
import { ListPagination } from "@/components/common/table/ListPagination";
import { useModal } from "@/providers/ModalProvider";
import { listToolsAction } from "@/server/actions/tools/list";
import { getMediaImageUrl } from '@/utils/media/imageUrl';
import { useQuery } from "@tanstack/react-query";
import { Eye,Pencil,Plus,Power,Trash2,Wrench } from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { DeleteToolModal } from "./DeleteToolModal";
import { IncludeToolModal } from "./IncludeToolModal";
import { ToggleToolStatusModal } from "./ToggleToolStatusModal";
import { ViewToolModal } from "./ViewToolModal";

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
    const [pageSize, setPageSize] = useState(10);

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey: ["tools", "list", page, pageSize],
        queryFn: () => listToolsAction({ page, size: pageSize }),
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
                <Button onClick={handleOpenInclude} className="h-11 w-24 shrink-0 justify-center whitespace-nowrap sm:w-52">
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
                    <div className="overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
                        <div className="hidden grid-cols-[minmax(0,1fr)_minmax(90px,0.65fr)_360px] gap-4 border-b border-j-gray-200 bg-j-gray-100/70 px-4 py-3 text-[10px] font-extrabold uppercase tracking-wide text-j-gray-400 md:grid">
                            <span>Ferramenta</span>
                            <span className="text-center">Status</span>
                            <span className="text-center">Ações</span>
                        </div>
                        <div className="divide-y divide-j-gray-100">
                            {data.content.map((tool) => (
                                <div key={tool.id} className="flex flex-col gap-3 p-4 transition-colors hover:bg-blue-50/30 md:grid md:grid-cols-[minmax(0,1fr)_minmax(90px,0.65fr)_360px] md:items-center md:gap-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        {tool.photoStorageKey ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={getMediaImageUrl(tool.photoStorageKey)} alt={`Foto de ${tool.name}`} className="h-16 w-28 shrink-0 sm:h-20 sm:w-36 rounded-lg border border-j-gray-200 object-cover" />
                                        ) : <span className="flex h-16 w-28 shrink-0 sm:h-20 sm:w-36 items-center justify-center rounded-lg bg-j-blue-800 text-j-yellow-300"><Wrench size={19} aria-hidden="true" /></span>}
                                        <div className="min-w-0">
                                            <h4 className="truncate font-extrabold text-j-blue-800" title={tool.name}>{tool.name}</h4>
                                            <span className={twMerge("mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-bold md:hidden", STATUS_BADGE_CLASS[tool.status])}>{STATUS_LABEL[tool.status]}</span>
                                        </div>
                                    </div>
                                    <span className={twMerge("hidden w-fit justify-self-center rounded-full px-2.5 py-1 text-xs font-bold md:inline-flex", STATUS_BADGE_CLASS[tool.status])}>{STATUS_LABEL[tool.status]}</span>
                                    <div className="grid grid-cols-4 gap-2">
                                        <button type="button" aria-label={`Visualizar ${tool.name}`} title="Visualizar" onClick={() => handleOpenView(tool.id)} className="flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-2 py-2 text-xs font-bold text-j-blue-700 transition-colors hover:bg-blue-100"><Eye size={15} aria-hidden="true" /><span className="hidden sm:inline">Visualizar</span></button>
                                        <button type="button" aria-label={`Editar ${tool.name}`} title="Editar" onClick={() => handleOpenEdit(tool.id)} className="flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-yellow-50 px-2 py-2 text-xs font-bold text-j-gray-700 transition-colors hover:bg-yellow-100"><Pencil size={15} className="text-j-yellow-500" aria-hidden="true" /><span className="hidden sm:inline">Editar</span></button>
                                        <button type="button" aria-label={`${tool.status === "ACTIVE" ? "Desativar" : "Ativar"} ${tool.name}`} title={tool.status === "ACTIVE" ? "Desativar" : "Ativar"} onClick={() => handleOpenToggleStatus(tool)} className="flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-purple-50 px-2 py-2 text-xs font-bold text-purple-600 transition-colors hover:bg-purple-100"><Power size={15} aria-hidden="true" /><span className="hidden sm:inline">{tool.status === "ACTIVE" ? "Desativar" : "Ativar"}</span></button>
                                        <button type="button" aria-label={`Excluir ${tool.name}`} title="Excluir" onClick={() => handleOpenDelete(tool)} className="flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-red-50 px-2 py-2 text-xs font-bold text-red-500 transition-colors hover:bg-red-100"><Trash2 size={15} aria-hidden="true" /><span className="hidden sm:inline">Excluir</span></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <ListPagination
                        itemLabel="ferramenta"
                        isFetching={isFetching}
                        pagination={{
                            pageIndex: data.number,
                            pageSize,
                            pageCount: data.totalPages,
                            rowCount: data.totalElements,
                            onChange: (next) => {
                                setPage(next.pageSize !== pageSize ? 0 : next.pageIndex);
                                setPageSize(next.pageSize);
                            },
                        }}
                    />
                </>
            )}
        </div>
    );
}

export default ToolsTabContent;
