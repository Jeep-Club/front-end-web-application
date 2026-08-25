'use client';

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, LoaderCircle, Plus, X } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { Button, ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { listUserRolesAction } from "@/actions/authorization/list-user-roles";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { ROLE_STATUS_LABEL } from "../users/user-display";
import { AddUserRoleModal } from "./AddUserRoleModal";
import { RevokeUserRoleModal } from "./RevokeUserRoleModal";

interface UserRolesViewModalProps {
    userId: number;
    userName: string;
}

export function UserRolesViewModal({ userId, userName }: UserRolesViewModalProps) {
    const { setContent, setOpen, setClose } = useModal();

    const permissions = useUserStore((state) => state.permissions);
    const canAssign = hasPermission(permissions, "AUTHORIZATION", "USER_ROLE_ASSIGN");
    const canRevoke = hasPermission(permissions, "AUTHORIZATION", "USER_ROLE_REVOKE");

    const { data: roles, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ["authorization", "users", userId, "roles"],
        queryFn: () => listUserRolesAction(userId),
    });

    const currentRoleIds = roles?.map((role) => role.id) ?? [];

    const handleAddRole = () => {
        setContent(
            <AddUserRoleModal userId={userId} userName={userName} currentRoleIds={currentRoleIds} />,
        );
        setOpen();
    };

    const handleRevokeRole = (role: RoleResponse) => {
        setContent(
            <RevokeUserRoleModal
                userId={userId}
                userName={userName}
                roleId={role.id}
                roleName={role.name}
                currentRoleIds={currentRoleIds}
            />,
        );
        setOpen();
    };

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
                className="absolute right-4 top-4 z-10 rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800 md:right-6 md:top-6"
            >
                <X className="w-5 h-5 md:w-[22px] md:h-[22px]" />
            </ButtonIcon>

            <header className="border-b border-j-gray-200 px-5 pb-5 pr-16 pt-6 md:px-8 md:pb-6 md:pr-20 md:pt-8">
                <h2 className="text-xl font-extrabold text-j-blue-800 md:text-2xl">
                    Cargos de {userName}
                </h2>
                <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                    Papéis de acesso atribuídos a este usuário.
                </p>
            </header>

            <div className="flex flex-col gap-4 px-5 py-5 md:px-8 md:py-6">
                {canAssign && (
                    <Button
                        type="button"
                        onClick={handleAddRole}
                        className="w-full sm:w-auto sm:self-end"
                    >
                        <Plus size={16} strokeWidth={3} />
                        Adicionar cargo
                    </Button>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-j-gray-500">
                        <LoaderCircle size={20} className="animate-spin" />
                        Carregando cargos...
                    </div>
                ) : error || !roles ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                        <AlertCircle size={34} className="text-red-500" />
                        <p className="max-w-md text-sm text-j-gray-600">
                            {extractApiErrorMessage(error, "Não foi possível carregar os cargos do usuário.")}
                        </p>
                        <Button
                            type="button"
                            onClick={() => void refetch()}
                            disabled={isFetching}
                        >
                            {isFetching ? "Tentando novamente..." : "Tentar novamente"}
                        </Button>
                    </div>
                ) : roles.length === 0 ? (
                    <p className="py-10 text-center text-sm italic text-j-gray-400">
                        Nenhum cargo vinculado a este usuário.
                    </p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {roles.map((role) => (
                            <div
                                key={role.id}
                                className="flex flex-col gap-2 rounded-xl border border-j-gray-200 bg-j-white p-4 shadow-sm"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm font-bold text-j-blue-800 md:text-base">
                                        {role.name}
                                    </span>
                                    <span
                                        className={twMerge(
                                            "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                                            role.status === "ACTIVE"
                                                ? "bg-j-green-100 text-j-green-700"
                                                : "bg-j-gray-200 text-j-gray-600",
                                        )}
                                    >
                                        {ROLE_STATUS_LABEL[role.status] ?? role.status}
                                    </span>
                                </div>
                                <span className="text-xs leading-relaxed text-j-gray-500 md:text-sm">
                                    {role.description}
                                </span>

                                {canRevoke && (
                                    <div className="mt-1 flex justify-end border-t border-j-gray-100 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => handleRevokeRole(role)}
                                            className="text-xs font-bold text-red-500 hover:text-red-600"
                                        >
                                            Revogar
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

export default UserRolesViewModal;
