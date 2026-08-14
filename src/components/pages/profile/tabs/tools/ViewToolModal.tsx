'use client';

import { useQuery } from "@tanstack/react-query";
import { X, Wrench, LoaderCircle } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { getToolDetailAction } from "@/actions/tools/detail";

const STATUS_LABEL: Record<ToolStatus, string> = {
    ACTIVE: "Ativa",
    INACTIVE: "Inativa",
    DELETED: "Excluída",
};

const STATUS_DOT_STYLE: Record<ToolStatus, string> = {
    ACTIVE: "bg-j-green-500",
    INACTIVE: "bg-j-gray-400",
    DELETED: "bg-red-500",
};

function ReadOnlyField({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex w-full flex-col gap-1.5">
            <span className="text-xs font-bold text-j-gray-700 md:text-sm">{label}</span>
            <div className="w-full rounded-lg border-2 border-j-gray-200 bg-j-gray-100 px-2.5 py-2 text-sm font-light text-j-gray-700 md:text-base">
                {value || "—"}
            </div>
        </div>
    );
}

interface ViewToolModalProps {
    toolId: number;
}

export function ViewToolModal({ toolId }: ViewToolModalProps) {
    const { setClose } = useModal();

    const { data: tool, isLoading } = useQuery({
        queryKey: ["tools", "detail", toolId],
        queryFn: () => getToolDetailAction(toolId),
    });

    return (
        <div
            className={`
                relative flex max-h-[92dvh] w-full max-w-125
                flex-col overflow-y-auto overflow-x-hidden
                rounded-3xl bg-j-white shadow-2xl
            `}
        >
            <ButtonIcon
                onClick={setClose}
                className="absolute right-4 top-4 z-10 rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800 md:right-6 md:top-6"
            >
                <X className="h-5 w-5 md:h-[22px] md:w-[22px]" />
            </ButtonIcon>

            <header className="border-b border-j-gray-200 px-5 pb-5 pr-16 pt-6 md:px-8 md:pb-6 md:pr-20 md:pt-8">
                <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300 shadow-sm">
                        <Wrench size={20} />
                    </span>
                    <div>
                        <h2 className="text-xl font-extrabold text-j-blue-800 md:text-2xl">Detalhes da ferramenta</h2>
                        <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                            Informações completas da ferramenta. Campos somente leitura.
                        </p>
                    </div>
                </div>
            </header>

            <div className="px-5 py-5 md:px-8 md:py-6">
                {isLoading || !tool ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-j-gray-500">
                        <LoaderCircle size={20} className="animate-spin" />
                        Carregando dados da ferramenta...
                    </div>
                ) : (
                    <div className="flex w-full flex-col gap-4">
                        <ReadOnlyField label="Nome" value={tool.name} />
                        <ReadOnlyField label="Descrição" value={tool.description} />

                        <div className="flex w-full flex-col gap-1.5">
                            <span className="text-xs font-bold text-j-gray-700 md:text-sm">Status</span>
                            <span className="flex w-fit items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-j-black">
                                <span className={twMerge("h-1.5 w-1.5 rounded-full", STATUS_DOT_STYLE[tool.status])} />
                                {STATUS_LABEL[tool.status]}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ViewToolModal;