'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { X } from "lucide-react";

import { Button, ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { activateChargeAssignmentAction } from "@/actions/billing/chargeAssignments/activate";
import { deactivateChargeAssignmentAction } from "@/actions/billing/chargeAssignments/deactivate";
import { ChargeAssignmentsModal } from "./ChargeAssignmentsModal";

interface ToggleChargeAssignmentStatusModalProps {
    assignmentId: number;
    chargeDefinitionId: number;
    chargeDefinitionName: string;
    audienceLabel: string;
    nextStatus: "ACTIVATE" | "DEACTIVATE";
}

export function ToggleChargeAssignmentStatusModal({
    assignmentId,
    chargeDefinitionId,
    chargeDefinitionName,
    audienceLabel,
    nextStatus,
}: ToggleChargeAssignmentStatusModalProps) {
    const { setContent, setClose } = useModal();
    const queryClient = useQueryClient();

    const isDeactivating = nextStatus === "DEACTIVATE";

    const backToAssignmentsList = () => {
        setContent(
            <ChargeAssignmentsModal
                chargeDefinitionId={chargeDefinitionId}
                chargeDefinitionName={chargeDefinitionName}
            />,
        );
    };

    const mutation = useMutation({
        mutationFn: () => (isDeactivating
            ? deactivateChargeAssignmentAction(assignmentId)
            : activateChargeAssignmentAction(assignmentId)),
        onSuccess: () => {
            toast.success(isDeactivating ? "Atribuição desativada com sucesso!" : "Atribuição ativada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["billing", "charge-definitions", chargeDefinitionId, "assignments"] });
            backToAssignmentsList();
        },
        onError: (error) => toast.error(error.message || "Erro ao alterar status da atribuição."),
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
                <h2 className="text-xl font-extrabold text-j-blue-800 md:text-2xl">
                    {isDeactivating ? "Desativar atribuição?" : "Ativar atribuição?"}
                </h2>
                <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                    Tem certeza que deseja {isDeactivating ? "desativar" : "ativar"} a atribuição para{" "}
                    <span className="font-bold text-j-blue-800">{audienceLabel}</span>?
                </p>
            </header>

            <div className="flex w-full gap-3 px-5 py-5 md:px-8 md:py-6">
                <Button
                    type="button"
                    onClick={backToAssignmentsList}
                    disabled={mutation.isPending}
                    className="flex-1 border-2 border-j-gray-200 bg-j-white text-j-gray-600 hover:border-j-gray-300 hover:bg-j-gray-100 hover:text-j-gray-700"
                >
                    Cancelar
                </Button>
                <Button
                    type="button"
                    onClick={() => mutation.mutate()}
                    disabled={mutation.isPending}
                    className={
                        isDeactivating
                            ? "flex-1 bg-red-500 text-white hover:bg-red-600 hover:text-white"
                            : "flex-1"
                    }
                >
                    {mutation.isPending
                        ? (isDeactivating ? "Desativando..." : "Ativando...")
                        : (isDeactivating ? "Desativar" : "Ativar")}
                </Button>
            </div>
        </div>
    );
}

export default ToggleChargeAssignmentStatusModal;
