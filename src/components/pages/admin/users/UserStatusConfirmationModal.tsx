"use client";

import { useState } from "react";
import { LoaderCircle, Power, PowerOff, X } from "lucide-react";

import { Button, ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { useModalFocusRestoration } from "./useModalFocusRestoration";

interface UserStatusConfirmationModalProps {
    user: AdminUser;
    onConfirm: (userId: number, status: "enable" | "disable") => Promise<void>;
    onSuccess: (updatedUser: AdminUser) => void;
}

export function UserStatusConfirmationModal({
    user,
    onConfirm,
}: UserStatusConfirmationModalProps) {
    useModalFocusRestoration();
    const { setClose } = useModal();
    const [isPending, setIsPending] = useState(false);
    const isEnabling = user.accountStatus === "DISABLED";
    const actionLabel = isEnabling ? "Reativar" : "Desativar";

    async function handleConfirm() {
        setIsPending(true);
        try {
            await onConfirm(user.id, isEnabling ? "enable" : "disable");
            setIsPending(false);
        } finally {
            setClose();
        }
    }

    return (
        <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="status-confirmation-title"
            aria-describedby="status-confirmation-description"
            className={`
                relative flex max-h-[92dvh] w-full max-w-125
                flex-col overflow-y-auto overflow-x-hidden
                rounded-3xl bg-j-white shadow-2xl
            `}
        >
            <ButtonIcon
                onClick={setClose}
                disabled={isPending}
                aria-label="Fechar confirmação"
                className="absolute right-4 top-4 z-10 rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800 md:right-6 md:top-6"
            >
                <X className="w-5 h-5 md:w-[22px] md:h-[22px]" />
            </ButtonIcon>

            <header className="border-b border-j-gray-200 px-5 pb-5 pr-16 pt-6 md:px-8 md:pb-6 md:pr-20 md:pt-8">
                <div className="flex items-start gap-4">
                    <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
                            isEnabling
                                ? "bg-j-green-100 text-j-green-700"
                                : "bg-red-500/10 text-red-500"
                        }`}
                    >
                        {isEnabling ? <Power size={20} /> : <PowerOff size={20} />}
                    </span>
                    <div>
                        <h2 id="status-confirmation-title" className="text-xl font-extrabold text-j-blue-800 md:text-2xl">
                            {actionLabel} usuário?
                        </h2>
                        <p id="status-confirmation-description" className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                            Você está prestes a {actionLabel.toLowerCase()}{" "}
                            <span className="font-bold text-j-blue-800">{user.name}</span>.
                            {isEnabling
                                ? " O acesso voltará a seguir o status retornado pelo sistema."
                                : " O usuário perderá o acesso ao sistema até que seja reativado."}
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
                <Button
                    type="button"
                    autoFocus
                    onClick={() => void handleConfirm()}
                    disabled={isPending}
                    className={`flex-1 text-white hover:text-white ${
                        isEnabling
                            ? "bg-j-green-600 hover:bg-j-green-700"
                            : "bg-red-500 hover:bg-red-600"
                    }`}
                >
                    {isPending ? (
                        <><LoaderCircle size={16} className="animate-spin" /> Processando...</>
                    ) : isEnabling ? (
                        <><Power size={16} /> Reativar</>
                    ) : (
                        <><PowerOff size={16} /> Desativar</>
                    )}
                </Button>
            </div>
        </div>
    );
}
