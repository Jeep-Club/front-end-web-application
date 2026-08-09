"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useController, useFormContext } from "react-hook-form";
import { AlertCircle, Check, KeyRound, LoaderCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";
import { twMerge } from "tailwind-merge";

import { Button, ButtonIcon } from "@/components/common/button";
import { Form } from "@/components/common/form";
import { useModal } from "@/providers/ModalProvider";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { ROLE_STATUS_LABEL } from "./user-display";
import { useModalFocusRestoration } from "./useModalFocusRestoration";

const roleAssignmentSchema = z.object({
    roleIds: z.array(z.number()),
});

type RoleAssignmentForm = z.infer<typeof roleAssignmentSchema>;

interface UserRolesModalProps {
    user: AdminUser;
    onLoadRoles: () => Promise<AdminRole[]>;
    onSaveRoles: (userId: number, roleIds: number[]) => Promise<AdminRole[]>;
    onSuccess: (userId: number, roles: AdminRole[]) => void;
}

function RoleOption({ role }: { role: AdminRole }) {
    const { control } = useFormContext<RoleAssignmentForm>();
    const { field } = useController({ name: "roleIds", control });
    const values = field.value ?? [];
    const isChecked = values.includes(role.id);
    const isUnavailable = role.status !== "ACTIVE" && !isChecked;

    function handleChange() {
        field.onChange(
            isChecked
                ? values.filter((roleId) => roleId !== role.id)
                : [...values, role.id],
        );
    }

    return (
        <label
            className={twMerge(
                "flex items-start gap-3 rounded-xl border p-3 transition-colors",
                isChecked
                    ? "border-j-yellow-300 bg-j-blue-700"
                    : "border-j-blue-600 bg-j-blue-900/30",
                isUnavailable ? "cursor-not-allowed opacity-55" : "cursor-pointer",
            )}
        >
            <input
                type="checkbox"
                checked={isChecked}
                disabled={isUnavailable}
                onChange={handleChange}
                onBlur={field.onBlur}
                className="peer sr-only"
            />
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-j-transparent-white bg-j-gray-500 text-transparent peer-checked:border-j-yellow-300 peer-checked:bg-j-yellow-300 peer-checked:text-j-blue-800 peer-focus-visible:outline-2 peer-focus-visible:outline-j-yellow-300">
                <Check size={14} strokeWidth={3} />
            </span>
            <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-j-white">{role.name}</span>
                    <span
                        className={twMerge(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                            role.status === "ACTIVE"
                                ? "bg-j-green-100 text-j-green-700"
                                : "bg-j-gray-200 text-j-gray-600",
                        )}
                    >
                        {ROLE_STATUS_LABEL[role.status]}
                    </span>
                </span>
                <span className="mt-1 block text-xs text-j-transparent-white">
                    {role.description ?? "Sem descrição."}
                </span>
                {role.status !== "ACTIVE" && isChecked && (
                    <span className="mt-1 block text-xs font-semibold text-j-yellow-300">
                        Vínculo legado: pode ser removido, mas não atribuído novamente.
                    </span>
                )}
            </span>
        </label>
    );
}

function RoleAssignmentFormContent({
    roles,
    user,
    isSaving,
    errorMessage,
    pendingRoleIds,
    onSubmit,
    onCancelRemoval,
    onConfirmRemoval,
}: {
    roles: AdminRole[];
    user: AdminUser;
    isSaving: boolean;
    errorMessage?: string;
    pendingRoleIds?: number[];
    onSubmit: (data: RoleAssignmentForm) => Promise<void>;
    onCancelRemoval: () => void;
    onConfirmRemoval: () => void;
}) {
    const { setClose } = useModal();
    const removedRoles = pendingRoleIds
        ? useModaler.roles.filter((role) => !pendingRoleIds.includes(role.id))
        : [];

    return (
        <Form<RoleAssignmentForm>
            schema={roleAssignmentSchema}
            onSubmit={onSubmit}
            onError={() => undefined}
            formOptions={{ defaultValues: { roleIds: user.roles.map((role) => role.id) } }}
            className="items-stretch gap-4"
        >
            <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
                {roles.map((role) => <RoleOption key={role.id} role={role} />)}
            </div>

            <p className="text-xs text-j-transparent-white">
                É permitido salvar sem nenhum papel. Papéis inativos ou excluídos só aparecem para preservar vínculos existentes.
            </p>

            {errorMessage && (
                <p role="alert" className="rounded-lg bg-j-red-500/20 p-3 text-sm text-j-red-100">
                    {errorMessage}
                </p>
            )}

            {pendingRoleIds ? (
                <div className="rounded-xl border border-j-yellow-300 bg-j-yellow-300/10 p-4">
                    <p className="font-bold text-j-yellow-300">Confirmar remoção de papéis?</p>
                    <p className="mt-1 text-sm text-j-white">
                        Serão removidos: {removedRoles.map((role) => role.name).join(", ")}.
                        O usuário poderá perder acessos associados imediatamente.
                    </p>
                    <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row">
                        <Button
                            type="button"
                            onClick={onCancelRemoval}
                            disabled={isSaving}
                            className="flex-1 border-2 border-j-transparent-white bg-transparent text-j-white hover:bg-j-transparent-white/10 hover:text-j-white"
                        >
                            Voltar
                        </Button>
                        <Button
                            type="button"
                            autoFocus
                            onClick={onConfirmRemoval}
                            disabled={isSaving}
                            className="flex-1 bg-j-red-500 text-white hover:bg-j-red-600 hover:text-white"
                        >
                            {isSaving ? <><LoaderCircle size={16} className="animate-spin" /> Salvando...</> : "Confirmar e salvar"}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    <Button
                        type="button"
                        onClick={setClose}
                        disabled={isSaving}
                        className="flex-1 border-2 border-j-transparent-white bg-transparent text-j-white hover:bg-j-transparent-white/10 hover:text-j-white"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 bg-j-yellow-300 text-j-blue-800 hover:bg-j-yellow-400 hover:text-j-blue-800"
                    >
                        {isSaving ? <><LoaderCircle size={16} className="animate-spin" /> Salvando...</> : "Salvar papéis"}
                    </Button>
                </div>
            )}
        </Form>
    );
}

export function UserRolesModal({
    user,
    onLoadRoles,
    onSaveRoles,
    onSuccess,
}: UserRolesModalProps) {
    useModalFocusRestoration();
    const { setClose } = useModal();
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [pendingRoleIds, setPendingRoleIds] = useState<number[]>();
    const { data: roles, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ["admin-users", "role-catalog"],
        queryFn: onLoadRoles,
        retry: false,
    });

    async function saveRoles(roleIds: number[]) {
        setIsSaving(true);
        setErrorMessage(undefined);
        try {
            const updatedRoles = await onSaveRoles(user.id, roleIds);
            onSuccess(user.id, updatedRoles);
            toast.success("Papéis do usuário atualizados com sucesso!");
            setClose();
        } catch (saveError) {
            const message = extractApiErrorMessage(saveError, "Não foi possível atualizar os papéis do usuário.");
            setErrorMessage(message);
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleSubmit(data: RoleAssignmentForm) {
        const removesRoles = user.roles.some((role) => !data.roleIds.includes(role.id));
        if (removesRoles) {
            setPendingRoleIds(data.roleIds);
            return;
        }
        await saveRoles(data.roleIds);
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-roles-title"
            className="relative flex max-h-[90dvh] w-full max-w-xl flex-col gap-5 overflow-y-auto rounded-2xl bg-j-blue-800 p-4 text-j-white shadow-[-1px_16px_23px_1px_rgba(0,0,0,0.35)] md:p-8"
        >
            <ButtonIcon
                autoFocus
                onClick={setClose}
                disabled={isSaving}
                aria-label="Fechar gerenciamento de papéis"
                className="absolute right-3 top-3 text-j-transparent-white hover:text-j-yellow-300 md:right-4 md:top-4"
            >
                <X size={22} />
            </ButtonIcon>

            <div className="flex flex-col gap-2 pr-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-j-blue-700 text-j-yellow-300">
                    <KeyRound size={20} />
                </span>
                <h2 id="user-roles-title" className="text-lg font-extrabold md:text-2xl">
                    Papéis de {user.name}
                </h2>
                <p className="text-xs text-j-transparent-white md:text-sm">
                    Selecione o conjunto completo de papéis que deve permanecer vinculado.
                </p>
            </div>

            {isLoading ? (
                <div className="flex min-h-56 items-center justify-center gap-2 text-j-transparent-white">
                    <LoaderCircle className="animate-spin" size={20} />
                    Carregando catálogo de papéis...
                </div>
            ) : error || !roles ? (
                <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
                    <AlertCircle className="text-j-red-200" size={34} />
                    <p className="text-sm">
                        {extractApiErrorMessage(error, "Não foi possível carregar o catálogo de papéis.")}
                    </p>
                    <Button type="button" onClick={() => void refetch()} disabled={isFetching}>
                        {isFetching ? "Tentando novamente..." : "Tentar novamente"}
                    </Button>
                </div>
            ) : (
                <RoleAssignmentFormContent
                    key={user.id}
                    roles={roles}
                    user={user}
                    isSaving={isSaving}
                    errorMessage={errorMessage}
                    pendingRoleIds={pendingRoleIds}
                    onSubmit={handleSubmit}
                    onCancelRemoval={() => setPendingRoleIds(undefined)}
                    onConfirmRemoval={() => pendingRoleIds && void saveRoles(pendingRoleIds)}
                />
            )}
        </div>
    );
}
