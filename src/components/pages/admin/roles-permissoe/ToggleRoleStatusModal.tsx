'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Power, X } from "lucide-react";
import { Button, ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { activateRoleAction } from "@/actions/authorization/activate-role";
import { deactivateRoleAction } from "@/actions/authorization/deactivate-role";

interface ToggleRoleStatusModalProps {
    roleId: number;
    roleName: string;
    nextStatus: "ACTIVATE" | "DEACTIVATE";
}

export function ToggleRoleStatusModal({ roleId, roleName, nextStatus }: ToggleRoleStatusModalProps) {
    const { setClose } = useModal();
    const queryClient = useQueryClient();

    const isDeactivating = nextStatus === "DEACTIVATE";

    const mutation = useMutation({
        mutationFn: () => (isDeactivating ? deactivateRoleAction(roleId) : activateRoleAction(roleId)),
        onSuccess: () => {
            toast.success(isDeactivating ? "Cargo desativado com sucesso!" : "Cargo ativado com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["authorization", "roles"] });
            setClose();
        },
        onError: (error) => toast.error(error.message || "Erro ao alterar status do cargo."),
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
                disabled={mutation.isPending}
                className="absolute right-4 top-4 z-10 rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800 md:right-6 md:top-6"
            >
                <X className="w-5 h-5 md:w-[22px] md:h-[22px]" />
            </ButtonIcon>

            <header className="border-b border-j-gray-200 px-5 pb-5 pr-16 pt-6 md:px-8 md:pb-6 md:pr-20 md:pt-8">
                <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300 shadow-sm">
                        <Power size={20} />
                    </span>
                    <div>
                        <h2 className="text-xl font-extrabold text-j-blue-800 md:text-2xl">
                            {isDeactivating ? "Desativar cargo?" : "Ativar cargo?"}
                        </h2>
                        <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                            Tem certeza que deseja {isDeactivating ? "desativar" : "ativar"} o cargo{" "}
                            <span className="font-bold text-j-blue-800">{roleName}</span>?
                            {isDeactivating && " Usuários com esse cargo podem perder os acessos associados a ele."}
                        </p>
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
                <Button
                    type="button"
                    onClick={() => mutation.mutate()}
                    disabled={mutation.isPending}
                    className="flex-1 bg-j-blue-700 text-j-white hover:bg-j-blue-800 hover:text-j-white"
                >
                    {mutation.isPending
                        ? (isDeactivating ? "Desativando..." : "Ativando...")
                        : (isDeactivating ? "Desativar" : "Ativar")}
                </Button>
            </div>
        </div>
    );
}

export default ToggleRoleStatusModal;
