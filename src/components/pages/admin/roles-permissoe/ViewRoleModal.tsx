'use client';

import { useQuery } from "@tanstack/react-query";
import { X, KeyRound, LoaderCircle } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { ButtonIcon } from "@/components/common/button";
import { ReadOnlyField } from "@/components/common/ReadOnlyField";
import { useModal } from "@/providers/ModalProvider";
import { getRoleAction } from "@/actions/authorization/get-role";
import { maskDate } from "@/utils/masks";

const ROLE_STATUS_LABEL: Record<RoleStatus, string> = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
    DELETED: "Excluído",
};

const ROLE_STATUS_STYLE: Record<RoleStatus, string> = {
    ACTIVE: "bg-j-green-100 text-j-green-700",
    INACTIVE: "bg-j-gray-200 text-j-gray-600",
    DELETED: "bg-red-100 text-red-600",
};

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
                relative w-full max-w-125
                flex flex-col gap-4 md:gap-6
                p-4 md:p-8 max-h-[90dvh] overflow-y-auto overflow-x-hidden
                bg-j-blue-800 rounded-2xl
                shadow-[-1px_16px_23px_1px_rgba(0,0,0,0.35)]
                text-j-white
            `}
        >
            <ButtonIcon
                onClick={setClose}
                className="absolute top-3 right-3 md:top-4 md:right-4 text-j-transparent-white hover:text-j-yellow-300"
            >
                <X className="w-5 h-5 md:w-[22px] md:h-[22px]" />
            </ButtonIcon>

            <div className="flex flex-col gap-2 pr-6 md:pr-8">
                <span className="flex w-10 h-10 items-center justify-center rounded-full bg-j-blue-700 text-j-yellow-300">
                    <KeyRound size={20} />
                </span>
                <h2 className="text-lg md:text-2xl font-extrabold text-j-white">Detalhes do cargo</h2>
                <p className="text-xs md:text-sm text-j-transparent-white">
                    Informações completas do cargo. Campos somente leitura.
                </p>
            </div>

            {isLoading || !role ? (
                <div className="flex items-center justify-center gap-2 py-10 text-j-transparent-white">
                    <LoaderCircle size={20} className="animate-spin" />
                    Carregando dados do cargo...
                </div>
            ) : (
                <div className="w-full flex flex-col gap-4">
                    <ReadOnlyField label="Nome" value={role.name} />
                    <ReadOnlyField label="Descrição" value={role.description} />

                    <div className="w-full flex flex-col gap-1.5">
                        <span className="text-xs md:text-sm font-bold text-j-white">Status</span>
                        <span
                            className={twMerge(
                                "w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
                                ROLE_STATUS_STYLE[role.status]
                            )}
                        >
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
    );
}

export default ViewRoleModal;
