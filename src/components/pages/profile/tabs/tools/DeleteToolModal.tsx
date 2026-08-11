'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AlertTriangle, X, Trash2, LoaderCircle } from "lucide-react";
import { Button, ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { deleteToolAction } from "@/actions/tools/delete";

interface DeleteToolModalProps {
    toolId: number;
    toolLabel: string;
}

export function DeleteToolModal({ toolId, toolLabel }: DeleteToolModalProps) {
    const { setClose } = useModal();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => deleteToolAction(toolId),
        onSuccess: () => {
            toast.success("Ferramenta excluída com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["tools", "list"] });
            setClose();
        },
        onError: (error) => toast.error(error.message || "Erro ao excluir ferramenta."),
    });

    return (
        <div className="relative flex w-full max-w-md flex-col gap-6 rounded-2xl bg-j-blue-800 p-6 text-j-white shadow-[-1px_16px_23px_1px_rgba(0,0,0,0.35)] md:p-8">
            <ButtonIcon
                onClick={setClose}
                disabled={mutation.isPending}
                className="absolute right-4 top-4 text-j-transparent-white hover:text-j-yellow-300"
            >
                <X size={22} />
            </ButtonIcon>

            <div className="flex flex-col items-center gap-3 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                    <AlertTriangle size={28} />
                </span>
                <h2 className="text-xl font-extrabold text-j-white md:text-2xl">Excluir ferramenta?</h2>
                <p className="text-sm text-j-transparent-white">
                    Tem certeza que deseja excluir <span className="font-bold text-j-white">{toolLabel}</span>?
                    Essa ação não pode ser desfeita.
                </p>
            </div>

            <div className="flex gap-3">
                <Button
                    type="button"
                    onClick={setClose}
                    disabled={mutation.isPending}
                    className="flex-1 border-2 border-j-transparent-white bg-transparent text-j-white hover:bg-j-transparent-white/10 hover:text-j-white"
                >
                    Cancelar
                </Button>
                <Button
                    type="button"
                    onClick={() => mutation.mutate()}
                    disabled={mutation.isPending}
                    className="flex-1 bg-red-500 text-white hover:bg-red-600 hover:text-white"
                >
                    {mutation.isPending ? (
                        <>Excluindo<LoaderCircle size={15} strokeWidth={3} className="animate-spin" /></>
                    ) : (
                        <>Excluir<Trash2 size={15} strokeWidth={3} /></>
                    )}
                </Button>
            </div>
        </div>
    );
}

export default DeleteToolModal;