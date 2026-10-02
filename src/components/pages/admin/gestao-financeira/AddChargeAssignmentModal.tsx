'use client';

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AlertCircle, LoaderCircle, X } from "lucide-react";

import { Button, ButtonIcon } from "@/components/common/button";
import { Select } from "@/components/common/select";
import { Input } from "@/components/common/input/input";
import { useModal } from "@/providers/ModalProvider";
import { listRolesAction } from "@/actions/authorization/list-roles";
import {
    assignChargeToAllMembersAction,
    assignChargeToEventParticipantsAction,
    assignChargeToRoleAction,
    assignChargeToUserAction,
} from "@/actions/billing/chargeAssignments/assign";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { ChargeAssignmentsModal } from "./ChargeAssignmentsModal";

interface AddChargeAssignmentModalProps {
    chargeDefinitionId: number;
    chargeDefinitionName: string;
}

const AUDIENCE_OPTIONS: Array<{ value: ChargeAudienceType; label: string }> = [
    { value: "ALL_MEMBERS", label: "Todos os membros" },
    { value: "USER", label: "Usuário específico" },
    { value: "ROLE", label: "Cargo" },
    { value: "EVENT_PARTICIPANTS", label: "Participantes de evento" },
];

export function AddChargeAssignmentModal({ chargeDefinitionId, chargeDefinitionName }: AddChargeAssignmentModalProps) {
    const { setContent, setClose } = useModal();
    const queryClient = useQueryClient();

    const [audienceType, setAudienceType] = useState<ChargeAudienceType | "">("");
    const [userId, setUserId] = useState("");
    const [roleId, setRoleId] = useState("");
    const [eventId, setEventId] = useState("");

    const backToAssignmentsList = () => {
        setContent(
            <ChargeAssignmentsModal
                chargeDefinitionId={chargeDefinitionId}
                chargeDefinitionName={chargeDefinitionName}
            />,
        );
    };

    const {
        data: roles,
        isLoading: isLoadingRoles,
        isError: isRolesError,
    } = useQuery({
        queryKey: ["admin-roles-list"],
        queryFn: () => listRolesAction(),
        enabled: audienceType === "ROLE",
        retry: false,
    });

    const mutation = useMutation({
        mutationFn: () => {
            if (audienceType === "ALL_MEMBERS") {
                return assignChargeToAllMembersAction(chargeDefinitionId);
            }

            if (audienceType === "USER") {
                return assignChargeToUserAction(chargeDefinitionId, Number(userId));
            }

            if (audienceType === "ROLE") {
                return assignChargeToRoleAction(chargeDefinitionId, Number(roleId));
            }

            if (audienceType === "EVENT_PARTICIPANTS") {
                return assignChargeToEventParticipantsAction(chargeDefinitionId, Number(eventId));
            }

            return Promise.reject(new Error("Selecione o público-alvo da atribuição."));
        },
        onSuccess: () => {
            toast.success("Atribuição criada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["billing", "charge-definitions", chargeDefinitionId, "assignments"] });
            backToAssignmentsList();
        },
        onError: (error) => toast.error(extractApiErrorMessage(error, "Erro ao criar atribuição.")),
    });

    const canSubmit = audienceType === "ALL_MEMBERS"
        || (audienceType === "USER" && userId.trim() !== "")
        || (audienceType === "ROLE" && roleId !== "")
        || (audienceType === "EVENT_PARTICIPANTS" && eventId.trim() !== "");

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
                    Adicionar atribuição
                </h2>
                <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                    Escolha para quem a cobrança{" "}
                    <span className="font-bold text-j-blue-800">{chargeDefinitionName}</span>{" "}
                    será aplicada.
                </p>
            </header>

            <div className="flex flex-col gap-4 px-5 py-5 md:px-8 md:py-6">
                <Select.Unregister
                    label="Público-alvo"
                    name="audienceType"
                    value={audienceType}
                    onChange={(event) => {
                        setAudienceType(event.target.value as ChargeAudienceType);
                        setUserId("");
                        setRoleId("");
                        setEventId("");
                    }}
                    labelClassName="text-j-gray-700"
                    className="border-j-gray-200 bg-j-gray-100 px-4 py-3 text-j-gray-700 focus:bg-j-white"
                >
                    <option value="">Selecione</option>
                    {AUDIENCE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </Select.Unregister>

                {audienceType === "USER" && (
                    <Input
                        type="number"
                        min="1"
                        label="ID do usuário"
                        name="userId"
                        placeholder="Ex.: 42"
                        value={userId}
                        onChange={(event) => setUserId(event.target.value)}
                        labelClassName="text-j-gray-700"
                        className="border-j-gray-200 bg-j-gray-100 px-4 py-3 text-j-gray-700 placeholder:text-j-gray-400 focus:bg-j-white"
                    />
                )}

                {audienceType === "ROLE" && (
                    isLoadingRoles ? (
                        <div className="flex items-center gap-2 text-sm text-j-gray-500">
                            <LoaderCircle size={16} className="animate-spin" />
                            Carregando cargos...
                        </div>
                    ) : isRolesError || !roles ? (
                        <div className="flex items-center gap-2 text-sm text-red-500">
                            <AlertCircle size={16} />
                            Não foi possível carregar os cargos.
                        </div>
                    ) : (
                        <Select.Unregister
                            label="Cargo"
                            name="roleId"
                            value={roleId}
                            onChange={(event) => setRoleId(event.target.value)}
                            labelClassName="text-j-gray-700"
                            className="border-j-gray-200 bg-j-gray-100 px-4 py-3 text-j-gray-700 focus:bg-j-white"
                        >
                            <option value="">Selecione</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </Select.Unregister>
                    )
                )}

                {audienceType === "EVENT_PARTICIPANTS" && (
                    <Input
                        type="number"
                        min="1"
                        label="ID do evento"
                        name="eventId"
                        placeholder="Ex.: 7"
                        value={eventId}
                        onChange={(event) => setEventId(event.target.value)}
                        labelClassName="text-j-gray-700"
                        className="border-j-gray-200 bg-j-gray-100 px-4 py-3 text-j-gray-700 placeholder:text-j-gray-400 focus:bg-j-white"
                    />
                )}

                <div className="flex w-full gap-3 border-t border-j-gray-200 pt-5">
                    <Button
                        type="button"
                        onClick={() => mutation.mutate()}
                        disabled={!canSubmit || mutation.isPending}
                        className="flex-1"
                    >
                        {mutation.isPending ? "Adicionando..." : "Adicionar atribuição"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default AddChargeAssignmentModal;
