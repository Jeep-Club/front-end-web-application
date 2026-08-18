"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, LoaderCircle, Plus, UserRound, X } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { Button, ButtonIcon } from "@/components/common/button";
import { ReadOnlyField } from "@/components/common/ReadOnlyField";
import { useModal } from "@/providers/ModalProvider";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { maskCPF, maskDate, maskPhoneNumber } from "@/utils/masks";
import { ROLE_STATUS_LABEL, USER_STATUS_LABEL, USER_STATUS_STYLE } from "../user-display";
import { useModalFocusRestoration } from "../useModalFocusRestoration";
import { useEffect, useState } from "react";
import { ModalRoot } from '@/components/common/modal/root';
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { listRolesAction } from "@/actions/authorization/list-roles";
import { putUserRoleAction } from "@/actions/admin/users/putRole";
import toast from "react-hot-toast";

interface UserDetailsModalProps {
    // userId: number;
    // canReadRoles: boolean;
    // onLoadUser: (userId: number) => Promise<UserListItem>;
    roles: RoleListResponse;
    user: AdminUser;
    modal?: boolean;
}

export function AdminUserDetailsPage({ user,roles, modal = false }: UserDetailsModalProps) {


    if (!modal) {
        return (
            <UserDetails user={user} roles={roles} />
        );
    }

    return <UserDetailsModal user={user} roles={roles} />;
}

export function UserDetails({ user, roles }: UserDetailsModalProps) {
    return (
        <div
            className="relative flex w-full flex-col gap-5 bg-j-white-800 p-4 text-j-black shadow-[-1px_16px_23px_1px_rgba(0,0,0,0.35)] md:p-8"
        >
            <PageHeader
                title=""
                breadcrumbs={[
                    { label: "Início", href: "/feed" },
                    { label: "Painel admin", href: "/admin" },
                    { label: "Usuários", href: "/admin/users" },
                    { label: "Detalhes do usuário " + user.name },
                ]}
            />
            <div className="flex flex-col gap-2 pr-8">
                <div className="flex items-center gap-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-j-blue-700 text-j-yellow-300">
                        <UserRound size={20} />
                    </span>
                    <h2 id="user-details-title" className="text-lg font-extrabold md:text-2xl">
                        Detalhes do usuário
                    </h2>
                </div>
                <p className="text-xs text-j-gray-500 md:text-sm">
                    Informações administrativas somente para consulta.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 bg-j-blue-800 p-4 text-j-white shadow-[-1px_16px_23px_1px_rgba(0,0,0,0.35)] rounded-2xl md:p-8">
                <ReadOnlyField label="ID" value={user.id} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                <ReadOnlyField label="Nome" value={user.name} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                <ReadOnlyField label="E-mail" value={user.email} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                <ReadOnlyField label="CPF" value={maskCPF(user.cpf)} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                <ReadOnlyField label="Telefone" value={user.phone ? maskPhoneNumber(user.phone) : null} valueClassName="bg-j-gray-500 font-normal text-j-white" />

                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-j-white md:text-sm">Status</span>
                    <span
                        className={twMerge(
                            "w-fit rounded-full px-3 py-1 text-xs font-bold",
                            USER_STATUS_STYLE[user.accountStatus],
                        )}
                    >
                        {USER_STATUS_LABEL[user.accountStatus]}
                    </span>
                </div>

                <ReadOnlyField
                    label="Troca de senha pendente"
                    value={user.passwordChangeRequired ? "Sim" : "Não"}
                    valueClassName="bg-j-gray-500 font-normal text-j-white"
                />
                <ReadOnlyField label="Data de cadastro" value={maskDate(user.createdAt)} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                <ReadOnlyField label="Última atualização" value={maskDate(user.updatedAt)} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                
                <UserRoles roles={roles} id={user.id}/>

            </div>
            
        </div>
    );
}

export function UserDetailsModal({
    // userId,
    // canReadRoles,
    // onLoadUser,
    user,
    roles,
}: UserDetailsModalProps) {
    // useModalFocusRestoration();
    const router = useRouter()
    // const { data: user, isLoading, error, refetch, isFetching } = useQuery({
    //     queryKey: ["admin-users", "details", userId],
    //     queryFn: () => onLoadUser(userId),
    //     retry: false,
    // });
    return (
        <ModalRoot isOpen={true} onClose={() => router.back()} >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="user-details-title"
                className="relative flex max-h-[90dvh] w-full max-w-2xl flex-col gap-5 overflow-y-auto overflow-x-hidden rounded-2xl bg-j-blue-800 p-4 text-j-white shadow-[-1px_16px_23px_1px_rgba(0,0,0,0.35)] md:p-8"
            >
                <ButtonIcon
                    autoFocus
                    onClick={() => router.back()}
                    aria-label="Fechar detalhes do usuário"
                    className="absolute right-3 top-3 text-j-transparent-white hover:text-j-yellow-300 md:right-4 md:top-4"
                >
                    <X size={22} />
                </ButtonIcon>

                <div className="flex flex-col gap-2 pr-8">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-j-blue-700 text-j-yellow-300">
                        <UserRound size={20} />
                    </span>
                    <h2 id="user-details-title" className="text-lg font-extrabold md:text-2xl">
                        Detalhes do usuário
                    </h2>
                    <p className="text-xs text-j-transparent-white md:text-sm">
                        Informações administrativas somente para consulta.
                    </p>
                </div>

                {/* {isLoading ? (
                <div className="flex min-h-56 items-center justify-center gap-2 text-j-transparent-white">
                    <LoaderCircle className="animate-spin" size={20} />
                    Carregando detalhes...
                </div>
            ) : error || !user ? (
                <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
                    <AlertCircle className="text-j-red-200" size={34} />
                    <p className="max-w-md text-sm text-j-white">
                        {extractApiErrorMessage(error, "Não foi possível carregar os detalhes do usuário.")}
                    </p>
                    <Button
                        type="button"
                        onClick={() => void refetch()}
                        disabled={isFetching}
                        className="bg-j-yellow-300 text-j-blue-800 hover:bg-j-yellow-400 hover:text-j-blue-800"
                    >
                        {isFetching ? "Tentando novamente..." : "Tentar novamente"}
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ReadOnlyField label="ID" value={user.id} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                    <ReadOnlyField label="Nome" value={user.name} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                    <ReadOnlyField label="E-mail" value={user.email} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                    <ReadOnlyField label="CPF" value={maskCPF(user.cpf)} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                    <ReadOnlyField label="Telefone" value={user.phone ? maskPhoneNumber(user.phone) : null} valueClassName="bg-j-gray-500 font-normal text-j-white" />

                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-j-white md:text-sm">Status</span>
                        <span
                            className={twMerge(
                                "w-fit rounded-full px-3 py-1 text-xs font-bold",
                                USER_STATUS_STYLE[user.status],
                            )}
                        >
                            {USER_STATUS_LABEL[user.status]}
                        </span>
                    </div>

                    <ReadOnlyField
                        label="Troca de senha pendente"
                        value={user.passwordChangeRequired ? "Sim" : "Não"}
                        valueClassName="bg-j-gray-500 font-normal text-j-white"
                    />
                    <ReadOnlyField label="Data de cadastro" value={maskDate(user.createdAt)} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                    <ReadOnlyField label="Última atualização" value={maskDate(user.updatedAt)} valueClassName="bg-j-gray-500 font-normal text-j-white" />

                    {canReadRoles && (
                        <div className="flex flex-col gap-2 sm:col-span-2">
                            <span className="text-xs font-bold text-j-white md:text-sm">Papéis de acesso</span>
                            {user.roles.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {user.roles.map((role) => (
                                        <span
                                            key={role.id}
                                            className={twMerge(
                                                "rounded-full px-3 py-1 text-xs font-bold",
                                                role.status === "ACTIVE"
                                                    ? "bg-j-yellow-300 text-j-blue-800"
                                                    : "bg-j-gray-200 text-j-gray-600",
                                            )}
                                        >
                                            {role.name} · {ROLE_STATUS_LABEL[role.status]}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-sm text-j-transparent-white">Nenhum papel vinculado.</span>
                            )}
                        </div>
                    )}
                </div>

                
            )} */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ReadOnlyField label="ID" value={user.id} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                    <ReadOnlyField label="Nome" value={user.name} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                    <ReadOnlyField label="E-mail" value={user.email} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                    <ReadOnlyField label="CPF" value={maskCPF(user.cpf)} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                    <ReadOnlyField label="Telefone" value={user.phone ? maskPhoneNumber(user.phone) : null} valueClassName="bg-j-gray-500 font-normal text-j-white" />

                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-j-white md:text-sm">Status</span>
                        <span
                            className={twMerge(
                                "w-fit rounded-full px-3 py-1 text-xs font-bold",
                                USER_STATUS_STYLE[user.accountStatus],
                            )}
                        >
                            {USER_STATUS_LABEL[user.accountStatus]}
                        </span>
                    </div>

                    <ReadOnlyField
                        label="Troca de senha pendente"
                        value={user.passwordChangeRequired ? "Sim" : "Não"}
                        valueClassName="bg-j-gray-500 font-normal text-j-white"
                    />
                    <ReadOnlyField label="Data de cadastro" value={maskDate(user.createdAt)} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                    <ReadOnlyField label="Última atualização" value={maskDate(user.updatedAt)} valueClassName="bg-j-gray-500 font-normal text-j-white" />

                            <UserRoles roles={roles} id={user.id} />
                </div>
            </div>
        </ModalRoot>
    );
}

export function UserRoles({ roles, id }: { roles: RoleListResponse, id: number }) {
   useEffect(() => {
        if (typeof window !== "undefined" && window.location.hash === "#roles") {
            const element = document.getElementById("roles");
            if (element) {
                // Um pequeno delay garante que o DOM do modal/página esteja totalmente renderizado
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 150);
            }
        }
    }, []);

    // Assumindo que roles é um array, caso a tipagem seja um objeto com um array dentro (ex: roles.data), ajuste o map.
    const [rolesArray, setRolesArray] = useState<RoleResponse[]>(roles || []);

    const { setContent, setOpen, setClose } = useModal();
    


    const mutation = useMutation({
        mutationFn: putUserRoleAction,
        onSuccess: () => {
            toast.success('Papéis atualizados com sucesso!');
            setClose();
        },
        onError: (error) => {
            toast.error(error.message || 'Erro ao atualizar papéis. Tente novamente.');
        }
    });   

    const handleAddRoles = async (role: RoleResponse) => {
        const roleIds = rolesArray.map(r => r.id);
        if (roleIds.includes(role.id)) {
            toast.error('Este papel já está vinculado ao usuário.');
            return;
        }
        roleIds.push(role.id);
        await mutation.mutateAsync({ id, roles: { roleIds: roleIds } }).then(() => {
            setRolesArray(prevRoles => [...prevRoles, role]);
        });
    }

    const handleRemoveRole = async (role: RoleResponse) => {
        const roleIds = rolesArray.map(r => r.id);
        roleIds.splice(roleIds.findIndex((rId) => rId === role.id), 1);
        await mutation.mutateAsync({ id, roles: { roleIds: roleIds } }).then(() => {
            setRolesArray(prevRoles => prevRoles.filter(r => r.id !== role.id));
        });
    }


    const handleAddRolesClick = () => {
        setContent(<UserRolesModal setClose={setClose} addRole={handleAddRoles} />);
        setOpen();
    }

    return (
        <div 
            id="roles" 
            className="flex flex-col gap-2 sm:col-span-2 scroll-mt-24"
        >
            <span className="text-xs font-bold text-j-white md:text-sm">Papéis de acesso</span>
            
            {rolesArray.length > 0 ? (
                <div className="flex flex-col gap-3">
                    {rolesArray.map((role) => (
                        <div 
                            key={role.id} 
                            className="flex flex-col gap-1 rounded-xl border border-j-transparent-white/20 bg-j-gray-500/50 p-4"
                        >
                            <div className="relative flex items-center justify-between gap-4">
                                <ButtonIcon
                                    type="button"
                                    onClick={() => handleRemoveRole(role)}
                                    disabled={mutation.isPending}
                                    className="absolute right-0 top-0 text-j-transparent-white hover:text-j-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <X size={16} />
                                </ButtonIcon>
                                <span className="font-bold text-j-white text-sm md:text-base">
                                    {role.name}
                                </span>
                                <span
                                    className={twMerge(
                                        "rounded-full px-3 py-1 text-[10px] uppercase font-bold tracking-wider",
                                        role.status === "ACTIVE"
                                            ? "bg-j-yellow-300 text-j-blue-800"
                                            : "bg-j-gray-200 text-j-gray-600"
                                    )}
                                >
                                    {ROLE_STATUS_LABEL[role.status] || role.status}
                                </span>
                            </div>
                            <span className="text-xs text-j-transparent-white md:text-sm leading-relaxed">
                                {role.description}
                            </span>
                            
                            {/* Opcional: Badge indicando se é CUSTOM ou SYSTEM
                            <div className="mt-2 flex">
                                <span className="text-[10px] font-semibold text-j-gray-300 bg-j-blue-800/50 px-2 py-0.5 rounded">
                                    Tipo: {role.}
                                </span>
                            </div> */}
                        </div>
                    ))}
                </div>
            ) : (
                <span className="text-sm text-j-transparent-white italic">
                    Nenhum papel de acesso vinculado a este usuário.
                </span>
            )}

            <Button
                onClick={handleAddRolesClick}
            >
                + Adicionar papeis
            </Button>
        </div>
    );
}

function UserRolesModal({setClose, addRole}: {setClose: () => void, addRole: (role: RoleResponse) => void}) {
   const { 
        data: roles, 
        isLoading, 
        error, 
        refetch, 
        isFetching 
    } = useQuery({
        queryKey: ["admin-roles-list"],
        queryFn: () => listRolesAction(),
        retry: false,
    });

    return (
        <div className="flex flex-col h-full max-h-[80vh]">
            <div className="p-4 md:p-6 border-b border-j-transparent-white/20 flex items-center justify-between shrink-0">
                <div>
                    <h2 className="text-lg font-bold text-j-white md:text-xl">Adicionar Papéis</h2>
                    <p className="text-xs text-j-transparent-white md:text-sm mt-1">
                        Selecione os papéis que deseja vincular ao usuário.
                    </p>
                </div>
                <Button 
                    type="button" 
                    onClick={setClose} 
                    className="text-sm bg-j-gray-500 text-j-white hover:bg-j-gray-400"
                >
                    Fechar
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {isLoading ? (
                    <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-j-transparent-white">
                        <LoaderCircle className="animate-spin" size={24} />
                        <span className="text-sm">Carregando papéis...</span>
                    </div>
                ) : error || !roles ? (
                    <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
                        <AlertCircle className="text-j-red-200" size={34} />
                        <p className="max-w-md text-sm text-j-white">
                            {error ? extractApiErrorMessage(error, "Não foi possível carregar a lista de papéis.") : "Erro desconhecido."}
                        </p>
                        <Button
                            type="button"
                            onClick={() => void refetch()}
                            disabled={isFetching}
                            className="bg-j-yellow-300 text-j-blue-800 hover:bg-j-yellow-400 mt-2"
                        >
                            {isFetching ? "Tentando novamente..." : "Tentar novamente"}
                        </Button>
                    </div>
                ) : roles.length === 0 ? (
                    <div className="flex min-h-40 items-center justify-center text-center">
                        <span className="text-sm text-j-transparent-white italic">
                            Nenhum papel de acesso encontrado.
                        </span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {roles.map((role) => (
                            <div 
                                key={role.id} 
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-j-transparent-white/20 bg-j-gray-500/30 p-4 transition-colors hover:bg-j-gray-500/50"
                            >
                                <div className="flex flex-col gap-1 flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-j-white text-sm md:text-base">
                                            {role.name}
                                        </span>
                                        <span
                                            className={twMerge(
                                                "rounded-full px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider",
                                                role.status === "ACTIVE"
                                                    ? "bg-j-yellow-300/20 text-j-yellow-300"
                                                    : "bg-j-gray-200/20 text-j-gray-300"
                                            )}
                                        >
                                            {ROLE_STATUS_LABEL?.[role.status] || role.status}
                                        </span>
                                    </div>
                                    <span className="text-xs text-j-transparent-white leading-relaxed line-clamp-2">
                                        {role.description}
                                    </span>
                                </div>
                                
                                <Button 
                                    type="button"
                                    onClick={() => addRole(role)}
                                    disabled={role.status !== "ACTIVE"}
                                    className="w-full sm:w-auto shrink-0 bg-j-yellow-300 text-j-blue-800 hover:bg-j-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Plus size={16} className="mr-1" strokeWidth={3} />
                                    Adicionar
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}