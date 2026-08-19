'use client';

import { useQuery } from "@tanstack/react-query";
import { X, ShieldCheck, LoaderCircle } from "lucide-react";
import { ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { listRolePermissionsAction } from "@/actions/authorization/list-role-permissions";
import { getModuleLabel, getPermissionName } from "./permissionLabels";

interface RolePermissionsModalProps {
    roleId: number;
    roleName: string;
}

export function RolePermissionsModal({ roleId, roleName }: RolePermissionsModalProps) {
    const { setClose } = useModal();

    const { data: permissions, isLoading, isError } = useQuery({
        queryKey: ["authorization", "roles", roleId, "permissions"],
        queryFn: () => listRolePermissionsAction(roleId),
    });

    const permissionsByModule = (permissions ?? []).reduce<Record<string, PermissionResponse[]>>((acc, permission) => {
        (acc[permission.module] ??= []).push(permission);
        return acc;
    }, {});

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
                        <ShieldCheck size={20} />
                    </span>
                    <div>
                        <h2 className="text-xl font-extrabold text-j-blue-800 md:text-2xl">
                            Permissões do cargo
                        </h2>
                        <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                            O que o cargo <span className="font-bold text-j-blue-800">{roleName}</span> pode acessar e fazer.
                        </p>
                    </div>
                </div>
            </header>

            <div className="px-5 py-5 md:px-8 md:py-6">
                {isLoading && (
                    <div className="flex items-center justify-center gap-2 py-10 text-j-gray-500">
                        <LoaderCircle size={20} className="animate-spin" />
                        Carregando permissões do cargo...
                    </div>
                )}

                {isError && (
                    <p className="py-4 text-sm text-red-600">
                        Não foi possível carregar as permissões deste cargo.
                    </p>
                )}

                {!isLoading && !isError && permissions && permissions.length > 0 && (
                    <div className="flex flex-col gap-5">
                        {Object.entries(permissionsByModule).map(([module, items]) => (
                            <div key={module}>
                                <h3 className="mb-3 text-sm font-black text-j-blue-800">
                                    {getModuleLabel(module)}
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {items.map((permission) => (
                                        <div
                                            key={permission.id}
                                            className="flex items-start gap-3 rounded-xl border border-j-gray-200 p-3"
                                        >
                                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-j-blue-800 text-j-yellow-300">
                                                <ShieldCheck size={18} />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-base font-black text-j-blue-800">
                                                    {getPermissionName(permission)}
                                                </p>
                                                <p className="mt-0.5 text-sm text-j-gray-600">
                                                    {permission.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && !isError && permissions && permissions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-j-gray-100 text-j-gray-400">
                            <ShieldCheck size={31} />
                        </div>

                        <h3 className="text-lg font-black text-j-blue-800">
                            Nenhuma permissão vinculada
                        </h3>

                        <p className="mt-1 max-w-md text-sm text-j-gray-600">
                            Esse cargo ainda não tem nenhuma permissão atribuída.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RolePermissionsModal;
