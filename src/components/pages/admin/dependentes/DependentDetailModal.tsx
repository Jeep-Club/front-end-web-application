'use client';

import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
    AlertCircle,
    Camera,
    LoaderCircle,
    Trash2,
    User,
    Users,
    X,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Button, ButtonIcon } from "@/components/common/button";
import { ReadOnlyField as CommonReadOnlyField } from "@/components/common/ReadOnlyField";
import { useModal } from "@/providers/ModalProvider";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { getDependentDetailAdminAction } from "@/server/actions/admin/dependents/detail";
import {
    removeDependentPhotoAdminAction,
    replaceDependentPhotoAdminAction,
} from "@/server/actions/admin/dependents/photo";
import {
    DEPENDENT_RELATIONSHIP_LABEL,
    DEPENDENT_STATUS_DOT_STYLE,
    DEPENDENT_STATUS_LABEL,
    formatDependentBirthDate,
    formatDependentCpf,
    formatDependentDateTime,
    formatDependentPhone,
    getAdminDependentPhotoUrl,
} from "./dependentDisplay";

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

interface DependentDetailModalProps {
    dependentId: number;
    userId: number;
    initialOwnerName?: string | null;
}

export function DependentDetailModal({
    dependentId,
    userId,
    initialOwnerName,
}: DependentDetailModalProps) {
    const { setClose } = useModal();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const permissions = useUserStore((state) => state.permissions);

    const canUpdatePhoto = hasPermission(
        permissions,
        "DEPENDENTS",
        "DEPENDENT_PHOTO_UPDATE",
    );

    const {
        data: dependent,
        isLoading,
        error,
        refetch,
        isFetching,
    } = useQuery({
        queryKey: ["admin", "dependents", "detail", dependentId],
        queryFn: () => getDependentDetailAdminAction(dependentId),
    });

    const uploadPhotoMutation = useMutation({
        mutationFn: async (file: File) => {
            const form = new FormData();
            form.set("photo", file, file.name);
            return replaceDependentPhotoAdminAction(
                dependent?.userId ?? userId,
                dependentId,
                form,
            );
        },
        onSuccess: () => {
            toast.success("Foto do dependente atualizada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["admin", "dependents"] });
            void refetch();
        },
        onError: (err) =>
            toast.error(err.message || "Não foi possível atualizar a foto do dependente."),
    });

    const removePhotoMutation = useMutation({
        mutationFn: () =>
            removeDependentPhotoAdminAction(
                dependent?.userId ?? userId,
                dependentId,
            ),
        onSuccess: () => {
            toast.success("Foto do dependente removida com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["admin", "dependents"] });
            void refetch();
        },
        onError: (err) =>
            toast.error(err.message || "Não foi possível remover a foto do dependente."),
    });

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        uploadPhotoMutation.mutate(file);
    };

    const photoUrl = dependent ? getAdminDependentPhotoUrl(dependent) : null;
    const isPhotoBusy = uploadPhotoMutation.isPending || removePhotoMutation.isPending;
    const canModifyCurrentPhoto =
        canUpdatePhoto && dependent?.status === "ACTIVE";

    return (
        <div
            className={`
                relative flex max-h-[92dvh] w-full max-w-140
                flex-col overflow-y-auto overflow-x-hidden
                rounded-3xl bg-j-white shadow-2xl
            `}
        >
            <ButtonIcon
                onClick={setClose}
                disabled={isPhotoBusy}
                className="absolute right-4 top-4 z-10 rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800 md:right-6 md:top-6"
            >
                <X className="h-5 w-5 md:h-[22px] md:w-[22px]" />
            </ButtonIcon>

            <header className="border-b border-j-gray-200 px-5 pb-5 pr-16 pt-6 md:px-8 md:pb-6 md:pr-20 md:pt-8">
                <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300 shadow-sm">
                        <Users size={20} />
                    </span>
                    <div>
                        <h2 className="text-xl font-extrabold text-j-blue-800 md:text-2xl">
                            Detalhes do dependente
                        </h2>
                        <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                            Ficha cadastral completa, vínculo com o associado titular e foto 3x4 privada.
                        </p>
                    </div>
                </div>
            </header>

            <div className="px-5 py-5 md:px-8 md:py-6">
                {isLoading ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-j-gray-500">
                        <LoaderCircle size={20} className="animate-spin" />
                        Carregando dados do dependente...
                    </div>
                ) : error || !dependent ? (
                    <div
                        role="alert"
                        className="flex flex-col items-center justify-center gap-3 py-8 text-center"
                    >
                        <AlertCircle size={32} className="text-red-500" />
                        <p className="text-sm text-j-gray-600">
                            {error instanceof Error
                                ? error.message
                                : "Não foi possível carregar os dados do dependente."}
                        </p>
                        <Button
                            type="button"
                            onClick={() => void refetch()}
                            disabled={isFetching}
                        >
                            {isFetching ? "Tentando novamente..." : "Tentar novamente"}
                        </Button>
                    </div>
                ) : (
                    <div className="flex w-full flex-col gap-5">
                        <div className="flex flex-col items-center gap-4 rounded-2xl border border-j-gray-200 bg-j-gray-100/60 p-4 sm:flex-row sm:items-center">
                            {photoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={photoUrl}
                                    alt={`Foto 3x4 de ${dependent.name}`}
                                    className="h-28 w-21 shrink-0 rounded-xl border border-j-gray-200 bg-j-white object-cover shadow-xs"
                                />
                            ) : (
                                <span className="flex h-28 w-21 shrink-0 items-center justify-center rounded-xl border border-j-gray-200 bg-j-blue-800 text-j-yellow-300 shadow-xs">
                                    <User size={28} aria-hidden="true" />
                                </span>
                            )}

                            <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center sm:items-start sm:text-left">
                                <div>
                                    <h3 className="text-base font-extrabold text-j-blue-800">
                                        {dependent.name}
                                    </h3>
                                    <p className="text-xs text-j-gray-500">
                                        {DEPENDENT_RELATIONSHIP_LABEL[dependent.relationshipType] ??
                                            dependent.relationshipType}{" "}
                                        • ID #{dependent.id}
                                    </p>
                                </div>

                                <span className="flex w-fit items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-j-black">
                                    <span
                                        className={twMerge(
                                            "h-2 w-2 rounded-full",
                                            DEPENDENT_STATUS_DOT_STYLE[dependent.status],
                                        )}
                                    />
                                    {DEPENDENT_STATUS_LABEL[dependent.status] ?? dependent.status}
                                </span>

                                {canModifyCurrentPhoto && (
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            disabled={isPhotoBusy}
                                            onClick={() => fileInputRef.current?.click()}
                                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-j-blue-800 px-3 py-1.5 text-xs font-bold text-j-white transition-colors hover:bg-j-blue-700 disabled:opacity-50"
                                        >
                                            <Camera size={14} aria-hidden="true" />
                                            {uploadPhotoMutation.isPending
                                                ? "Enviando..."
                                                : photoUrl
                                                    ? "Substituir foto"
                                                    : "Enviar foto 3x4"}
                                        </button>

                                        {photoUrl && (
                                            <button
                                                type="button"
                                                disabled={isPhotoBusy}
                                                onClick={() => removePhotoMutation.mutate()}
                                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                                            >
                                                <Trash2 size={14} aria-hidden="true" />
                                                {removePhotoMutation.isPending
                                                    ? "Removendo..."
                                                    : "Remover foto"}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                            <ReadOnlyField
                                label="Titular (Associado)"
                                value={
                                    dependent.ownerName || initialOwnerName
                                        ? `${dependent.ownerName || initialOwnerName} (ID #${dependent.userId})`
                                        : `ID #${dependent.userId}`
                                }
                            />
                            <ReadOnlyField
                                label="Parentesco"
                                value={
                                    DEPENDENT_RELATIONSHIP_LABEL[dependent.relationshipType] ??
                                    dependent.relationshipType
                                }
                            />
                            <ReadOnlyField
                                label="CPF"
                                value={formatDependentCpf(dependent.cpf)}
                            />
                            <ReadOnlyField
                                label="Data de nascimento"
                                value={formatDependentBirthDate(dependent.birthDate)}
                            />
                            <ReadOnlyField
                                label="Telefone"
                                value={formatDependentPhone(dependent.phoneNumber)}
                            />
                            <ReadOnlyField
                                label="Cadastrado em"
                                value={formatDependentDateTime(dependent.createdAt)}
                            />
                            <ReadOnlyField
                                label="Última atualização"
                                value={formatDependentDateTime(dependent.updatedAt)}
                            />
                            {dependent.archivedAt && (
                                <ReadOnlyField
                                    label="Arquivado em"
                                    value={formatDependentDateTime(dependent.archivedAt)}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DependentDetailModal;
