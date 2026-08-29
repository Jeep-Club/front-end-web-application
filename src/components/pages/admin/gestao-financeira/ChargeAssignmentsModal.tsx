'use client';

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, LoaderCircle, Plus, Power, PowerOff, X } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { Button, ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { listChargeAssignmentsAction } from "@/actions/billing/chargeAssignments/list";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { CHARGE_AUDIENCE_TYPE_LABEL } from "./chargeAssignmentDisplay";
import { AddChargeAssignmentModal } from "./AddChargeAssignmentModal";
import { ToggleChargeAssignmentStatusModal } from "./ToggleChargeAssignmentStatusModal";

interface ChargeAssignmentsModalProps {
    chargeDefinitionId: number;
    chargeDefinitionName: string;
}

function describeAssignment(assignment: ChargeAssignment): string {
    if (assignment.audienceType === "USER") {
        return `Usuário #${assignment.userId}`;
    }

    if (assignment.audienceType === "ROLE") {
        return `Cargo #${assignment.roleId}`;
    }

    if (assignment.audienceType === "EVENT_PARTICIPANTS") {
        return `Participantes do evento #${assignment.eventId}`;
    }

    return CHARGE_AUDIENCE_TYPE_LABEL.ALL_MEMBERS;
}

export function ChargeAssignmentsModal({ chargeDefinitionId, chargeDefinitionName }: ChargeAssignmentsModalProps) {
    const { setContent, setOpen, setClose } = useModal();

    const permissions = useUserStore((state) => state.permissions);
    const canCreate = hasPermission(permissions, "BILLING", "CHARGE_ASSIGNMENT_CREATE");
    const canUpdate = hasPermission(permissions, "BILLING", "CHARGE_ASSIGNMENT_UPDATE");

    const { data, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ["billing", "charge-definitions", chargeDefinitionId, "assignments"],
        queryFn: () => listChargeAssignmentsAction(chargeDefinitionId, { page: "0", size: "50" }),
    });

    const assignments = data?.content ?? [];

    const handleAdd = () => {
        setContent(
            <AddChargeAssignmentModal
                chargeDefinitionId={chargeDefinitionId}
                chargeDefinitionName={chargeDefinitionName}
            />,
        );
        setOpen();
    };

    const handleToggleStatus = (assignment: ChargeAssignment) => {
        setContent(
            <ToggleChargeAssignmentStatusModal
                assignmentId={assignment.id}
                chargeDefinitionId={chargeDefinitionId}
                chargeDefinitionName={chargeDefinitionName}
                audienceLabel={describeAssignment(assignment)}
                nextStatus={assignment.active ? "DEACTIVATE" : "ACTIVATE"}
            />,
        );
        setOpen();
    };

    return (
        <div
            className={`
                relative flex max-h-[92dvh] w-full max-w-2xl
                flex-col overflow-y-auto overflow-x-hidden
                rounded-3xl bg-j-white shadow-2xl
            `}
        >
            <ButtonIcon
                onClick={setClose}
                className="absolute right-4 top-4 z-10 rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800 md:right-6 md:top-6"
            >
                <X className="w-5 h-5 md:w-[22px] md:h-[22px]" />
            </ButtonIcon>

            <header className="border-b border-j-gray-200 px-5 pb-5 pr-16 pt-6 md:px-8 md:pb-6 md:pr-20 md:pt-8">
                <h2 className="text-xl font-extrabold text-j-blue-800 md:text-2xl">
                    Atribuições de {chargeDefinitionName}
                </h2>
                <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                    Defina para quem essa cobrança se aplica.
                </p>
            </header>

            <div className="flex flex-col gap-4 px-5 py-5 md:px-8 md:py-6">
                {canCreate && (
                    <Button
                        type="button"
                        onClick={handleAdd}
                        className="w-full sm:w-auto sm:self-end"
                    >
                        <Plus size={16} strokeWidth={3} />
                        Adicionar atribuição
                    </Button>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-j-gray-500">
                        <LoaderCircle size={20} className="animate-spin" />
                        Carregando atribuições...
                    </div>
                ) : error || !data ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                        <AlertCircle size={34} className="text-red-500" />
                        <p className="max-w-md text-sm text-j-gray-600">
                            {extractApiErrorMessage(error, "Não foi possível carregar as atribuições.")}
                        </p>
                        <Button
                            type="button"
                            onClick={() => void refetch()}
                            disabled={isFetching}
                        >
                            {isFetching ? "Tentando novamente..." : "Tentar novamente"}
                        </Button>
                    </div>
                ) : assignments.length === 0 ? (
                    <p className="py-10 text-center text-sm italic text-j-gray-400">
                        Nenhuma atribuição criada para esta cobrança ainda.
                    </p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {assignments.map((assignment) => (
                            <div
                                key={assignment.id}
                                className="flex flex-col gap-2 rounded-xl border border-j-gray-200 bg-j-white p-4 shadow-sm"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <span className="text-[10px] font-bold uppercase tracking-wide text-j-gray-400">
                                            {CHARGE_AUDIENCE_TYPE_LABEL[assignment.audienceType]}
                                        </span>
                                        <p className="truncate text-sm font-bold text-j-blue-800 md:text-base">
                                            {describeAssignment(assignment)}
                                        </p>
                                    </div>

                                    <span
                                        className={twMerge(
                                            "shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                                            assignment.active
                                                ? "bg-j-green-100 text-j-green-700"
                                                : "bg-j-gray-200 text-j-gray-600",
                                        )}
                                    >
                                        {assignment.active ? "Ativa" : "Inativa"}
                                    </span>
                                </div>

                                {canUpdate && (
                                    <div className="mt-1 flex justify-end border-t border-j-gray-100 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleStatus(assignment)}
                                            className={twMerge(
                                                "flex items-center gap-1.5 text-xs font-bold",
                                                assignment.active
                                                    ? "text-red-500 hover:text-red-600"
                                                    : "text-j-green-600 hover:text-j-green-700",
                                            )}
                                        >
                                            {assignment.active ? <PowerOff size={14} /> : <Power size={14} />}
                                            {assignment.active ? "Desativar" : "Ativar"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChargeAssignmentsModal;
