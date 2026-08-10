'use client';

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { X, ListChecks, LoaderCircle, Check } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { listPermissionsAction } from "@/actions/authorization/list-permissions";
import { listRolePermissionsAction } from "@/actions/authorization/list-role-permissions";
import { assignPermissionToRoleAction } from "@/actions/authorization/assign-role-permission";
import { revokePermissionFromRoleAction } from "@/actions/authorization/revoke-role-permission";
import { getModuleLabel, getPermissionName } from "./permissionLabels";

interface ManageRolePermissionsModalProps {
    roleId: number;
    roleName: string;
    roleProtected: boolean;
}

interface PermissionRowProps {
    permission: PermissionResponse;
    checked: boolean;
    disabled: boolean;
    disabledReason?: string;
    isPending: boolean;
    onToggle: (checked: boolean) => void;
}

function PermissionRow({ permission, checked, disabled, disabledReason, isPending, onToggle }: PermissionRowProps) {
    return (
        <label
            title={disabled ? disabledReason : undefined}
            className={twMerge(
                "flex w-full items-start gap-3 rounded-xl border border-j-gray-200 p-3 transition-colors",
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-j-gray-100/60"
            )}
        >
            <input
                type="checkbox"
                checked={checked}
                disabled={disabled || isPending}
                onChange={(e) => onToggle(e.target.checked)}
                className="peer sr-only"
            />
            <span
                className={twMerge(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                    checked ? "border-j-blue-800 bg-j-blue-800 text-j-yellow-300" : "border-j-gray-300 bg-j-white text-transparent"
                )}
            >
                {isPending ? <LoaderCircle size={12} className="animate-spin text-j-gray-400" /> : <Check size={14} strokeWidth={3} />}
            </span>
            <div className="min-w-0">
                <p className="text-sm font-black text-j-blue-800">{getPermissionName(permission)}</p>
                <p className="mt-0.5 text-xs text-j-gray-600">{permission.description}</p>
            </div>
        </label>
    );
}

export function ManageRolePermissionsModal({ roleId, roleName, roleProtected }: ManageRolePermissionsModalProps) {
    const { setClose } = useModal();
    const queryClient = useQueryClient();
    const userPermissions = useUserStore((state) => state.permissions);
    const canAssign = hasPermission(userPermissions, "AUTHORIZATION", "PERMISSION_ASSIGN");
    const canRevoke = hasPermission(userPermissions, "AUTHORIZATION", "PERMISSION_REVOKE");

    const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

    const rolePermissionsQueryKey = ["authorization", "roles", roleId, "permissions"];

    const { data: catalog, isLoading: isLoadingCatalog, isError: isCatalogError } = useQuery({
        queryKey: ["authorization", "permissions"],
        queryFn: listPermissionsAction,
    });

    const { data: rolePermissions, isLoading: isLoadingRolePermissions, isError: isRolePermissionsError } = useQuery({
        queryKey: rolePermissionsQueryKey,
        queryFn: () => listRolePermissionsAction(roleId),
    });

    const assignedIds = new Set((rolePermissions ?? []).map((permission) => permission.id));

    const catalogByModule = (catalog ?? []).reduce<Record<string, PermissionResponse[]>>((acc, permission) => {
        (acc[permission.module] ??= []).push(permission);
        return acc;
    }, {});

    const isLoading = isLoadingCatalog || isLoadingRolePermissions;
    const isError = isCatalogError || isRolePermissionsError;

    const handleToggle = async (permission: PermissionResponse, nextChecked: boolean) => {
        if (roleProtected) return;

        setPendingIds((prev) => new Set(prev).add(permission.id));

        try {
            if (nextChecked) {
                await assignPermissionToRoleAction(roleId, permission.id);
                toast.success(`"${getPermissionName(permission)}" adicionada ao cargo.`);
            } else {
                await revokePermissionFromRoleAction(roleId, permission.id);
                toast.success(`"${getPermissionName(permission)}" removida do cargo.`);
            }
            queryClient.invalidateQueries({ queryKey: rolePermissionsQueryKey });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao atualizar permissão do cargo.");
        } finally {
            setPendingIds((prev) => {
                const next = new Set(prev);
                next.delete(permission.id);
                return next;
            });
        }
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
                <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300 shadow-sm">
                        <ListChecks size={20} />
                    </span>
                    <div>
                        <h2 className="text-xl font-extrabold text-j-blue-800 md:text-2xl">
                            Gerenciar permissões
                        </h2>
                        <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                            Marque ou desmarque o que o cargo <span className="font-bold text-j-blue-800">{roleName}</span> pode acessar e fazer. Cada alteração é salva na hora.
                        </p>
                    </div>
                </div>
            </header>

            <div className="px-5 py-5 md:px-8 md:py-6">
                {isLoading && (
                    <div className="flex items-center justify-center gap-2 py-10 text-j-gray-500">
                        <LoaderCircle size={20} className="animate-spin" />
                        Carregando permissões...
                    </div>
                )}

                {isError && (
                    <p className="py-4 text-sm text-red-600">
                        Não foi possível carregar as permissões.
                    </p>
                )}

                {!isLoading && !isError && catalog && catalog.length > 0 && (
                    <div className="flex flex-col gap-5">
                        {Object.entries(catalogByModule).map(([module, items]) => (
                            <div key={module}>
                                <h3 className="mb-3 text-sm font-black text-j-blue-800">
                                    {getModuleLabel(module)}
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {items.map((permission) => {
                                        const checked = assignedIds.has(permission.id);
                                        const missingPermission = checked ? !canRevoke : !canAssign;
                                        const disabled = roleProtected || missingPermission;
                                        const disabledReason = roleProtected
                                            ? "As permissões deste cargo são gerenciadas pelo sistema e não podem ser alteradas."
                                            : missingPermission
                                                ? (checked ? "Você não tem permissão para revogar permissões." : "Você não tem permissão para atribuir permissões.")
                                                : undefined;
                                        return (
                                            <PermissionRow
                                                key={permission.id}
                                                permission={permission}
                                                checked={checked}
                                                disabled={disabled}
                                                disabledReason={disabledReason}
                                                isPending={pendingIds.has(permission.id)}
                                                onToggle={(nextChecked) => handleToggle(permission, nextChecked)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && !isError && catalog && catalog.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-j-gray-100 text-j-gray-400">
                            <ListChecks size={31} />
                        </div>

                        <h3 className="text-lg font-black text-j-blue-800">
                            Nenhuma permissão cadastrada
                        </h3>

                        <p className="mt-1 max-w-md text-sm text-j-gray-600">
                            As permissões sincronizadas pelo sistema vão aparecer aqui.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManageRolePermissionsModal;
