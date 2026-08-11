'use client';

import { useQuery } from "@tanstack/react-query";
import { X, Wrench, LoaderCircle } from "lucide-react";
import { Button, ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { getToolDetailAction } from "@/actions/tools/detail";

const STATUS_LABELS: Record<ToolStatus, string> = {
    ACTIVE: "Ativa",
    INACTIVE: "Inativa",
    DELETED: "Excluída",
};

function ReadOnlyField({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex w-full flex-col gap-1.5">
            <span className="text-xs font-bold text-j-white md:text-sm">{label}</span>
            <div className="w-full rounded-lg border-2 border-transparent bg-input-bg px-2.5 py-2 text-sm font-light text-input-text md:text-base">
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
        <div className="relative flex w-full max-w-md flex-col gap-6 rounded-2xl bg-j-blue-800 p-6 text-j-white shadow-[-1px_16px_23px_1px_rgba(0,0,0,0.35)] md:p-8">
            <ButtonIcon
                onClick={setClose}
                className="absolute right-4 top-4 text-j-transparent-white hover:text-j-yellow-300"
            >
                <X className="h-5 w-5" />
            </ButtonIcon>

            <div className="flex flex-col gap-2 pr-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-j-blue-700 text-j-yellow-300">
                    <Wrench size={20} />
                </span>
                <h2 className="text-lg font-extrabold text-j-white md:text-2xl">Detalhes da ferramenta</h2>
                <p className="text-xs text-j-transparent-white md:text-sm">Campos somente leitura.</p>
            </div>

            {isLoading || !tool ? (
                <div className="flex items-center justify-center gap-2 py-10 text-j-transparent-white">
                    <LoaderCircle size={20} className="animate-spin" />
                    Carregando dados da ferramenta...
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <ReadOnlyField label="Nome" value={tool.name} />
                    <ReadOnlyField label="Descrição" value={tool.description} />
                    <ReadOnlyField label="Status" value={STATUS_LABELS[tool.status]} />

                    <Button type="button" onClick={setClose} className="mt-2 w-full">
                        Fechar
                    </Button>
                </div>
            )}
        </div>
    );
}

export default ViewToolModal;