"use client";
import { ConfirmButton } from "@/components/common/button/ConfirmButton";

import { useState } from "react";
import { LoaderCircle, LogOut, X } from "lucide-react";
import { Button, ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";

export function LogoutConfirmationModal({ onConfirm }: { onConfirm: () => Promise<unknown> }) {
    const { setClose } = useModal();
    const [isPending, setIsPending] = useState(false);

    async function confirm() {
        if (isPending) return;
        setIsPending(true);
        try {
            await onConfirm();
            setClose();
        } catch {
            // The logout mutation presents the error and allows retrying here.
            setIsPending(false);
        }
    }

    return <section role="alertdialog" aria-modal="true" aria-labelledby="logout-title" aria-describedby="logout-description" className="relative w-full max-w-md rounded-3xl border border-j-gray-200 bg-j-white p-6 shadow-2xl">
        <ButtonIcon type="button" onClick={setClose} disabled={isPending} aria-label="Fechar confirmação" className="absolute right-4 top-4 rounded-full bg-j-gray-100 p-2 text-j-gray-600"><X size={18} /></ButtonIcon>
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300"><LogOut size={23} aria-hidden="true" /></span>
        <h2 id="logout-title" className="text-xl font-extrabold text-j-blue-800">Sair da conta?</h2>
        <p id="logout-description" className="mt-2 text-sm leading-relaxed text-j-gray-500">Sua sessão será encerrada. Para acessar novamente, será necessário fazer login.</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
            <Button type="button" onClick={setClose} disabled={isPending} className="min-h-11 border border-j-gray-200 bg-j-white text-j-gray-600 hover:bg-j-gray-100 hover:text-j-gray-700">Cancelar</Button>
            <ConfirmButton type="button" onClick={confirm} disabled={isPending} className="min-h-11 gap-2">{isPending ? <><LoaderCircle size={16} className="animate-spin" />Saindo...</> : "Sair"}</ConfirmButton>
        </div>
    </section>;
}
