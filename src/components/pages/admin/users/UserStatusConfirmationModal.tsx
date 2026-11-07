"use client";

import { ConfirmButton } from "@/components/common/button/ConfirmButton";
import { Archive, ArchiveRestore, LoaderCircle, Power, PowerOff, X } from "lucide-react";
import { useState } from "react";

import { Button, ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { useModalFocusRestoration } from "./useModalFocusRestoration";

interface UserStatusConfirmationModalProps {
    user: AdminUser;
    action?: AdminUserLifecycleAction;
    onConfirm: (userId: number, status: AdminUserLifecycleAction) => Promise<AdminUser>;
    onSuccess: (updatedUser: AdminUser) => void;
}

const ACTION_CONFIG: Record<
    AdminUserLifecycleAction,
    {
        title: string;
        verb: string;
        buttonLabel: string;
        description: string;
        iconBg: string;
        buttonClass: string;
    }
> = {
    enable: {
        title: "Reativar usuário?",
        verb: "reativar",
        buttonLabel: "Reativar",
        description: "O acesso do usuário voltará a ficar habilitado no sistema.",
        iconBg: "bg-j-green-100 text-j-green-700",
        buttonClass: "bg-j-green-600 hover:bg-j-green-700",
    },
    disable: {
        title: "Inativar usuário?",
        verb: "inativar",
        buttonLabel: "Inativar",
        description: "O usuário perderá o acesso ao sistema e suas sessões ativas serão encerradas até que seja reativado.",
        iconBg: "bg-red-500/10 text-red-500",
        buttonClass: "bg-red-500 hover:bg-red-600",
    },
    archive: {
        title: "Arquivar usuário?",
        verb: "arquivar",
        buttonLabel: "Arquivar",
        description: "O cadastro será retirado de circulação e sessões, tokens e convites pendentes serão revogados.",
        iconBg: "bg-amber-100 text-amber-800",
        buttonClass: "bg-amber-600 hover:bg-amber-700",
    },
    unarchive: {
        title: "Desarquivar usuário?",
        verb: "desarquivar",
        buttonLabel: "Desarquivar",
        description: "O cadastro retornará ao estado Inativo. O acesso continuará bloqueado até que o usuário seja reativado explicitamente.",
        iconBg: "bg-j-blue-100 text-j-blue-800",
        buttonClass: "bg-j-blue-800 hover:bg-j-blue-700",
    },
};

export function UserStatusConfirmationModal({
    user,
    action,
    onConfirm,
    onSuccess,
}: UserStatusConfirmationModalProps) {
    useModalFocusRestoration();
    const { setClose } = useModal();
    const [isPending, setIsPending] = useState(false);

    const resolvedAction: AdminUserLifecycleAction =
        action ?? (user.status === "ACTIVE" ? "disable" : user.status === "ARCHIVED" ? "unarchive" : "enable");
    const config = ACTION_CONFIG[resolvedAction];

    const IconComponent =
        resolvedAction === "enable"
            ? Power
            : resolvedAction === "disable"
                ? PowerOff
                : resolvedAction === "archive"
                    ? Archive
                    : ArchiveRestore;

    async function handleConfirm() {
        setIsPending(true);
        try {
            const updatedUser = await onConfirm(user.id, resolvedAction);
            onSuccess(updatedUser);
            setClose();
        } catch {
            // The parent mutation already reports the failure; keep this modal open.
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="status-confirmation-title"
            aria-describedby="status-confirmation-description"
            className="relative flex max-h-[92dvh] w-full max-w-125 flex-col overflow-y-auto overflow-x-hidden rounded-3xl bg-j-white shadow-2xl"
        >
            <ButtonIcon
                onClick={setClose}
                disabled={isPending}
                aria-label="Fechar confirmação"
                className="absolute right-4 top-4 z-10 rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800 md:right-6 md:top-6"
            >
                <X className="h-5 w-5 md:h-[22px] md:w-[22px]" />
            </ButtonIcon>

            <header className="border-b border-j-gray-200 px-5 pb-5 pr-16 pt-6 md:px-8 md:pb-6 md:pr-20 md:pt-8">
                <div className="flex items-start gap-4">
                    <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ${config.iconBg}`}
                    >
                        <IconComponent size={20} />
                    </span>
                    <div>
                        <h2 id="status-confirmation-title" className="text-xl font-extrabold text-j-blue-800 md:text-2xl">
                            {config.title}
                        </h2>
                        <p id="status-confirmation-description" className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                            Você está prestes a {config.verb}{" "}
                            <span className="font-bold text-j-blue-800">{user.name}</span>.{" "}
                            {config.description}
                        </p>
                    </div>
                </div>
            </header>

            <div className="flex w-full gap-3 px-5 py-5 md:px-8 md:py-6">
                <Button
                    type="button"
                    onClick={setClose}
                    disabled={isPending}
                    className="flex-1 border-2 border-j-gray-200 bg-j-white text-j-gray-600 hover:border-j-gray-300 hover:bg-j-gray-100 hover:text-j-gray-700"
                >
                    Cancelar
                </Button>
                <ConfirmButton
                    type="button"
                    autoFocus
                    onClick={() => void handleConfirm()}
                    disabled={isPending}
                    className={`flex-1 text-white hover:text-white ${config.buttonClass}`}
                >
                    {isPending ? (
                        <><LoaderCircle size={16} className="animate-spin" /> Processando...</>
                    ) : (
                        <><IconComponent size={16} /> {config.buttonLabel}</>
                    )}
                </ConfirmButton>
            </div>
        </div>
    );
}
