'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Archive, ArchiveRestore, Power, X } from "lucide-react";
import { Button, ButtonIcon } from "@/components/common/button";
import { ConfirmButton } from "@/components/common/button/ConfirmButton";
import { useModal } from "@/providers/ModalProvider";
import {
    archiveDependentAdminAction,
    disableDependentAdminAction,
    enableDependentAdminAction,
    unarchiveDependentAdminAction,
} from "@/server/actions/admin/dependents/lifecycle";

interface LifecycleAdminDependentModalProps {
    dependentId: number;
    userId: number;
    dependentName: string;
    action: AdminDependentLifecycleAction;
}

const ACTION_CONFIG: Record<
    AdminDependentLifecycleAction,
    {
        title: string;
        verb: string;
        buttonText: string;
        pendingText: string;
        successMessage: string;
        note?: string;
    }
> = {
    ENABLE: {
        title: "Ativar dependente?",
        verb: "ativar",
        buttonText: "Ativar",
        pendingText: "Ativando...",
        successMessage: "Dependente ativado com sucesso!",
    },
    DISABLE: {
        title: "Desativar dependente?",
        verb: "desativar",
        buttonText: "Desativar",
        pendingText: "Desativando...",
        successMessage: "Dependente desativado com sucesso!",
        note: "O dependente permanecerá no cadastro operacional com o CPF reservado, mas não poderá ser editado pelo titular enquanto estiver inativo.",
    },
    ARCHIVE: {
        title: "Arquivar dependente?",
        verb: "arquivar",
        buttonText: "Arquivar",
        pendingText: "Arquivando...",
        successMessage: "Dependente arquivado com sucesso!",
        note: "Ao desarquivar futuramente, o cadastro retornará para o status Inativo antes de poder ser reativado.",
    },
    UNARCHIVE: {
        title: "Desarquivar dependente?",
        verb: "desarquivar",
        buttonText: "Desarquivar",
        pendingText: "Desarquivando...",
        successMessage: "Dependente desarquivado para o status Inativo!",
        note: "Após o desarquivamento, o dependente ficará Inativo e poderá ser ativado explicitamente se desejado.",
    },
};

export function LifecycleAdminDependentModal({
    dependentId,
    userId,
    dependentName,
    action,
}: LifecycleAdminDependentModalProps) {
    const { setClose } = useModal();
    const queryClient = useQueryClient();
    const config = ACTION_CONFIG[action];

    const mutation = useMutation({
        mutationFn: () => {
            switch (action) {
                case "ENABLE":
                    return enableDependentAdminAction(userId, dependentId);
                case "DISABLE":
                    return disableDependentAdminAction(userId, dependentId);
                case "ARCHIVE":
                    return archiveDependentAdminAction(userId, dependentId);
                case "UNARCHIVE":
                    return unarchiveDependentAdminAction(userId, dependentId);
            }
        },
        onSuccess: () => {
            toast.success(config.successMessage);
            queryClient.invalidateQueries({ queryKey: ["admin", "dependents"] });
            queryClient.invalidateQueries({ queryKey: ["dependents"] });
            setClose();
        },
        onError: (error) =>
            toast.error(error.message || "Erro ao alterar o status do dependente."),
    });

    const Icon =
        action === "ARCHIVE"
            ? Archive
            : action === "UNARCHIVE"
                ? ArchiveRestore
                : Power;

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
                disabled={mutation.isPending}
                className="absolute right-4 top-4 z-10 rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800 md:right-6 md:top-6"
            >
                <X className="h-5 w-5 md:h-[22px] md:w-[22px]" />
            </ButtonIcon>

            <header className="border-b border-j-gray-200 px-5 pb-5 pr-16 pt-6 md:px-8 md:pb-6 md:pr-20 md:pt-8">
                <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300 shadow-sm">
                        <Icon size={20} />
                    </span>
                    <div>
                        <h2 className="text-xl font-extrabold text-j-blue-800 md:text-2xl">
                            {config.title}
                        </h2>
                        <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                            Tem certeza que deseja {config.verb}{" "}
                            <span className="font-bold text-j-blue-800">{dependentName}</span>?
                        </p>
                        {config.note && (
                            <p className="mt-2 rounded-xl border border-j-gray-200 bg-j-gray-100/70 p-2.5 text-xs text-j-gray-600">
                                {config.note}
                            </p>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex w-full gap-3 px-5 py-5 md:px-8 md:py-6">
                <Button
                    type="button"
                    onClick={setClose}
                    disabled={mutation.isPending}
                    className="flex-1 border-2 border-j-gray-200 bg-j-white text-j-gray-600 hover:border-j-gray-300 hover:bg-j-gray-100 hover:text-j-gray-700"
                >
                    Cancelar
                </Button>
                <ConfirmButton
                    type="button"
                    onClick={() => mutation.mutate()}
                    disabled={mutation.isPending}
                    className="flex-1 bg-j-blue-700 text-j-white hover:bg-j-blue-800 hover:text-j-white"
                >
                    {mutation.isPending ? config.pendingText : config.buttonText}
                </ConfirmButton>
            </div>
        </div>
    );
}

export default LifecycleAdminDependentModal;
