"use client";

import { useState } from "react";
import { AlertTriangle, LoaderCircle, Power, PowerOff, X } from "lucide-react";
import toast from "react-hot-toast";

import { Button, ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import type { UserListItem } from "@/types/admin/users";
import { useModalFocusRestoration } from "./useModalFocusRestoration";

interface UserStatusConfirmationModalProps {
    user: UserListItem;
    onConfirm: (userId: number) => Promise<UserListItem>;
    onSuccess: (updatedUser: UserListItem) => void;
}

export function UserStatusConfirmationModal({
    user,
    onConfirm,
    onSuccess,
}: UserStatusConfirmationModalProps) {
    useModalFocusRestoration();
    const { setClose } = useModal();
    const [isPending, setIsPending] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const isEnabling = user.status === "DISABLED";
    const actionLabel = isEnabling ? "Reativar" : "Desativar";

    async function handleConfirm() {
        setIsPending(true);
        setErrorMessage(undefined);

        try {
            const updatedUser = await onConfirm(user.id);
            onSuccess(updatedUser);
            toast.success(`Usuário ${isEnabling ? "reativado" : "desativado"} com sucesso!`);
            setClose();
        } catch (error) {
            const message = extractApiErrorMessage(error, `Não foi possível ${actionLabel.toLowerCase()} o usuário.`);
            setErrorMessage(message);
            toast.error(message);
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
            className="relative flex w-full max-w-md flex-col gap-6 rounded-2xl bg-j-blue-800 p-6 text-j-white shadow-[-1px_16px_23px_1px_rgba(0,0,0,0.35)] md:p-8"
        >
            <ButtonIcon
                onClick={setClose}
                disabled={isPending}
                aria-label="Fechar confirmação"
                className="absolute right-4 top-4 text-j-transparent-white hover:text-j-yellow-300"
            >
                <X size={22} />
            </ButtonIcon>

            <div className="flex flex-col items-center gap-3 text-center">
                <span className={`flex h-14 w-14 items-center justify-center rounded-full ${isEnabling ? "bg-j-green-500/20 text-j-green-200" : "bg-j-red-500/20 text-j-red-200"}`}>
                    <AlertTriangle size={28} />
                </span>
                <h2 id="status-confirmation-title" className="text-xl font-extrabold md:text-2xl">
                    {actionLabel} usuário?
                </h2>
                <p id="status-confirmation-description" className="text-sm text-j-transparent-white">
                    Você está prestes a {actionLabel.toLowerCase()} <span className="font-bold text-j-white">{user.name}</span>.
                    {isEnabling
                        ? " O acesso voltará a seguir o status retornado pelo sistema."
                        : " O usuário perderá o acesso ao sistema até que seja reativado."}
                </p>
            </div>

            {errorMessage && (
                <p role="alert" className="rounded-lg bg-j-red-500/20 p-3 text-center text-sm text-j-red-100">
                    {errorMessage}
                </p>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Button
                    type="button"
                    onClick={setClose}
                    disabled={isPending}
                    className="flex-1 border-2 border-j-transparent-white bg-transparent text-j-white hover:bg-j-transparent-white/10 hover:text-j-white"
                >
                    Cancelar
                </Button>
                <Button
                    type="button"
                    autoFocus
                    onClick={() => void handleConfirm()}
                    disabled={isPending}
                    className={`flex-1 text-white hover:text-white ${isEnabling ? "bg-j-green-600 hover:bg-j-green-700" : "bg-j-red-500 hover:bg-j-red-600"}`}
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
