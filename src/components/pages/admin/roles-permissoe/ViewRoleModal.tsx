'use client';

import { useQuery } from "@tanstack/react-query";
import { X, KeyRound, LoaderCircle } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { ButtonIcon } from "@/components/common/button";
import { ReadOnlyField as CommonReadOnlyField } from "@/components/common/ReadOnlyField";
import { useModal } from "@/providers/ModalProvider";
import { getRoleAction } from "@/actions/authorization/get-role";
import { maskDate } from "@/utils/masks";

const ROLE_STATUS_LABEL: Record<RoleStatus, string> = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
    DELETED: "Excluído",
};

const ROLE_STATUS_DOT_STYLE: Record<RoleStatus, string> = {
    ACTIVE: "bg-j-green-500",
    INACTIVE: "bg-j-gray-400",
    DELETED: "bg-red-500",
};

function ReadOnlyField({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <CommonReadOnlyField
            label={label}
            value={value}
            labelClassName="text-j-gray-700"
            valueClassName="border-j-gray-200 bg-j-gray-100 text-j-gray-700"
        />
    );
}

interface ViewRoleModalProps {
    roleId: number;
}

export function ViewRoleModal({ roleId }: ViewRoleModalProps) {
    const { setClose } = useModal();

    const { data: role, isLoading } = useQuery({
        queryKey: ["authorization", "roles", roleId],
        queryFn: () => getRoleAction(roleId),
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
                className="absolute right-4 top-4 z-10 rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800 md:right-6 md:top-6"
            >
                <X className="w-5 h-5 md:w-[22px] md:h-[22px]" />
            </ButtonIcon>

            <header className="border-b border-j-gray-200 px-5 pb-5 pr-16 pt-6 md:px-8 md:pb-6 md:pr-20 md:pt-8">
                <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300 shadow-sm">
                        <KeyRound size={20} />
                    </span>
                    <div>
                        <h2 className="text-xl font-extrabold text-j-blue-800 md:text-2xl">Detalhes do cargo</h2>
                        <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                            Informações completas do cargo. Campos somente leitura.
                        </p>
                    </div>
                </div>
            </header>

            <div className="px-5 py-5 md:px-8 md:py-6">
                {isLoading || !role ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-j-gray-500">
                        <LoaderCircle size={20} className="animate-spin" />
                        Carregando dados do cargo...
                    </div>
                ) : (
                    <div className="w-full flex flex-col gap-4">
                        <ReadOnlyField label="Nome" value={role.name} />
                        <ReadOnlyField label="Descrição" value={role.description} />

                        <div className="w-full flex flex-col gap-1.5">
                            <span className="text-xs md:text-sm font-bold text-j-gray-700">Status</span>
                            <span className="flex w-fit items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-j-black">
                                <span className={twMerge("h-1.5 w-1.5 rounded-full", ROLE_STATUS_DOT_STYLE[role.status])} />
                                {ROLE_STATUS_LABEL[role.status]}
                            </span>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-4">
                            <ReadOnlyField label="Criado em" value={maskDate(role.createdAt)} />
                            <ReadOnlyField label="Atualizado em" value={maskDate(role.updatedAt)} />
                        </div>

                        {role.status === "DELETED" && (
                            <ReadOnlyField label="Excluído em" value={maskDate(role.deletedAt)} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ViewRoleModal;
