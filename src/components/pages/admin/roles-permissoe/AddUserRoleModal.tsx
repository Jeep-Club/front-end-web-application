'use client';

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AlertCircle, KeyRound, LoaderCircle, Plus, X } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { Button, ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { listRolesAction } from "@/actions/authorization/list-roles";
import { putUserRoleAction } from "@/actions/admin/users/putRole";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { ROLE_STATUS_LABEL } from "../users/user-display";
import { UserRolesViewModal } from "./UserRolesViewModal";

interface AddUserRoleModalProps {
    userId: number;
    userName: string;
    currentRoleIds: number[];
}

export function AddUserRoleModal({ userId, userName, currentRoleIds }: AddUserRoleModalProps) {
    const { setContent, setClose } = useModal();
    const queryClient = useQueryClient();
    const [pendingRole, setPendingRole] = useState<RoleResponse | null>(null);

    const backToRolesView = () => {
        setContent(<UserRolesViewModal userId={userId} userName={userName} />);
    };

    const { data: allRoles, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ["admin-roles-list"],
        queryFn: () => listRolesAction(),
        retry: false,
    });

    const roles = allRoles?.filter((role) => !currentRoleIds.includes(role.id));

    const mutation = useMutation({
        mutationFn: (role: RoleResponse) => putUserRoleAction({
            id: userId,
            roles: { roleIds: [...currentRoleIds, role.id] },
        }),
        onSuccess: (_, role) => {
            toast.success(`Cargo "${role.name}" atribuído com sucesso!`);
            queryClient.invalidateQueries({ queryKey: ["authorization", "users", userId, "roles"] });
            backToRolesView();
        },
        onError: (error) => toast.error(error.message || "Erro ao atribuir cargo."),
    });

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

            {pendingRole ? (
                <>
                    <header className="border-b border-j-gray-200 px-5 pb-5 pr-16 pt-6 md:px-8 md:pb-6 md:pr-20 md:pt-8">
                        <div className="flex items-start gap-4">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300 shadow-sm">
                                <KeyRound size={20} />
                            </span>
                            <div>
                                <h2 className="text-xl font-extrabold text-j-blue-800 md:text-2xl">
                                    Confirmar atribuição?
                                </h2>
                                <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                                    Deseja atribuir o cargo{" "}
                                    <span className="font-bold text-j-blue-800">{pendingRole.name}</span>{" "}
                                    a <span className="font-bold text-j-blue-800">{userName}</span>?
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="flex w-full gap-3 px-5 py-5 md:px-8 md:py-6">
                        <Button
                            type="button"
                            onClick={() => setPendingRole(null)}
                            disabled={mutation.isPending}
                            className="flex-1 border-2 border-j-gray-200 bg-j-white text-j-gray-600 hover:border-j-gray-300 hover:bg-j-gray-100 hover:text-j-gray-700"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={() => mutation.mutate(pendingRole)}
                            disabled={mutation.isPending}
                            className="flex-1 bg-j-yellow-300 text-j-black hover:bg-j-yellow-500 hover:text-j-black"
                        >
                            {mutation.isPending ? "Atribuindo..." : "Confirmar"}
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <header className="border-b border-j-gray-200 px-5 pb-5 pr-16 pt-6 md:px-8 md:pb-6 md:pr-20 md:pt-8">
                        <div className="flex items-start gap-4">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300 shadow-sm">
                                <Plus size={20} />
                            </span>
                            <div>
                                <h2 className="text-xl font-extrabold text-j-blue-800 md:text-2xl">
                                    Adicionar cargo
                                </h2>
                                <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                                    Selecione o cargo que deseja atribuir a{" "}
                                    <span className="font-bold text-j-blue-800">{userName}</span>.
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="px-5 py-5 md:px-8 md:py-6">
                        {isLoading ? (
                            <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-j-gray-500">
                                <LoaderCircle className="animate-spin" size={24} />
                                <span className="text-sm">Carregando cargos...</span>
                            </div>
                        ) : error || !roles ? (
                            <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
                                <AlertCircle className="text-red-500" size={34} />
                                <p className="max-w-md text-sm text-j-gray-600">
                                    {extractApiErrorMessage(error, "Não foi possível carregar a lista de cargos.")}
                                </p>
                                <Button
                                    type="button"
                                    onClick={() => void refetch()}
                                    disabled={isFetching}
                                    className="mt-2"
                                >
                                    {isFetching ? "Tentando novamente..." : "Tentar novamente"}
                                </Button>
                            </div>
                        ) : roles.length === 0 ? (
                            <div className="flex min-h-40 items-center justify-center text-center">
                                <span className="text-sm text-j-gray-400 italic">
                                    {allRoles && allRoles.length > 0
                                        ? "Este usuário já possui todos os cargos disponíveis."
                                        : "Nenhum cargo cadastrado."}
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {roles.map((role) => (
                                    <div
                                        key={role.id}
                                        className="flex flex-col gap-4 rounded-xl border border-j-gray-200 bg-j-white p-4 shadow-sm transition-colors hover:bg-j-gray-100/60 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex flex-1 flex-col gap-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-j-blue-800 md:text-base">
                                                    {role.name}
                                                </span>
                                                <span
                                                    className={twMerge(
                                                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                                        role.status === "ACTIVE"
                                                            ? "bg-j-green-100 text-j-green-700"
                                                            : "bg-j-gray-200 text-j-gray-600",
                                                    )}
                                                >
                                                    {ROLE_STATUS_LABEL[role.status] ?? role.status}
                                                </span>
                                            </div>
                                            <span className="text-xs leading-relaxed text-j-gray-500 line-clamp-2">
                                                {role.description}
                                            </span>
                                        </div>

                                        <Button
                                            type="button"
                                            onClick={() => setPendingRole(role)}
                                            disabled={role.status !== "ACTIVE"}
                                            className="w-full shrink-0 sm:w-auto disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Plus size={16} className="mr-1" strokeWidth={3} />
                                            Adicionar
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default AddUserRoleModal;
