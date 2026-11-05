"use client";

import { useQuery,useQueryClient } from "@tanstack/react-query";
import {
    AlertCircle,
    Archive,
    ArchiveRestore,
    BriefcaseBusiness,
    CheckCircle2,
    History,
    LoaderCircle,
    LockKeyhole,
    Pencil,
    Plus,
    Power,
    PowerOff,
    RefreshCw,
    Save,
    ShieldCheck,
    Trash2,
    UserRound,
    X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect,useMemo,useState } from "react";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";

import { Button } from "@/components/common/button";
import { Form } from "@/components/common/form";
import { Input } from "@/components/common/input";
import { ModalRoot } from "@/components/common/modal/root";
import { ReadOnlyField } from "@/components/common/ReadOnlyField";
import { Select } from "@/components/common/select";
import { AddUserRoleModal } from "@/components/pages/admin/roles-permissoe/AddUserRoleModal";
import { useModal } from "@/providers/ModalProvider";
import {
    adminUpdateUserFormSchema,
    type AdminUpdateUserFormData,
    adminUserComplementaryProfileFormSchema,
    type AdminUserComplementaryProfileFormData,
} from "@/schemas/admin/users";
import { getAdminUserAction } from "@/server/actions/admin/users/detail";
import {
    deleteAdminUserAction,
    getAdminUserDeletionHistoryAction,
    patchUserStatusAction,
} from "@/server/actions/admin/users/patchStatus";
import {
    getAdminUserProfileAction,
    replaceAdminUserProfileAction,
    updateAdminUserAction,
} from "@/server/actions/admin/users/update";
import { listUserRolesAction } from "@/server/actions/authorization/list-user-roles";
import { useUserStore } from "@/stores/userStore";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { maskCEP,maskCPF,maskDate,maskPhoneNumber } from "@/utils/masks";
import { hasPermission } from "@/utils/permission/hasPermission";
import { ROLE_STATUS_LABEL,USER_STATUS_LABEL,USER_STATUS_STYLE } from "../user-display";
import { UserStatusConfirmationModal } from "../UserStatusConfirmationModal";
import { UserWorkspace,type UserWorkspaceOption } from "../UserWorkspace";
import { UserActivationInvitation } from "./UserActivationInvitation";
import { hasAdminSecurityReadPermission,UserSecurityTab } from "./UserSecurityTab";

const BRAZILIAN_STATES = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

interface UserDetailsModalProps {
    user: AdminUser;
    modal?: boolean;
}

export function AdminUserDetailsLoader({ userId, modal = false }: { userId: number; modal?: boolean }) {
    const router = useRouter();
    const { data: user, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ["admin-users", "details", userId],
        queryFn: () => getAdminUserAction(userId),
        retry: false,
    });

    if (user) return <AdminUserDetailsPage user={user} modal={modal} />;

    const content = isLoading ? (
        <div className="flex min-h-64 items-center justify-center gap-3 text-j-gray-500">
            <LoaderCircle size={22} className="animate-spin" />
            <span>Carregando dados do usuário...</span>
        </div>
    ) : (
        <div className="flex min-h-64 flex-col items-center justify-center gap-4 p-6 text-center">
            <AlertCircle size={34} className="text-j-red-500" />
            <div>
                <h2 className="text-lg font-extrabold text-j-blue-800">Não foi possível carregar este usuário</h2>
                <p role="alert" className="mt-2 text-sm text-j-gray-600">
                    {error instanceof Error ? error.message : "Ocorreu uma falha ao carregar os dados."}
                </p>
            </div>
            <Button type="button" onClick={() => void refetch()} disabled={isFetching}>
                <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
                {isFetching ? "Tentando novamente..." : "Tentar novamente"}
            </Button>
        </div>
    );

    if (modal) {
        return (
            <ModalRoot isOpen onClose={() => router.back()} contentClassName="max-w-4xl">
                <div className="max-h-[calc(100dvh-2rem)] w-full overscroll-contain overflow-y-auto rounded-xl bg-j-white shadow-2xl [webkit-overflow-scrolling:touch]">{content}</div>
            </ModalRoot>
        );
    }

    return <main className="flex min-h-[70dvh] items-center justify-center p-4">{content}</main>;
}

const fieldStyle = {
    labelClassName: "text-xs font-medium text-j-gray-500",
    valueClassName: "min-h-0 break-words rounded-none border-0 bg-transparent p-0 font-medium text-j-gray-700",
};

export function AdminUserDetailsPage({ user, modal = false }: UserDetailsModalProps) {
    return modal ? <UserDetailsModal user={user} /> : <UserDetails user={user} />;
}

export function UserDetails({ user }: UserDetailsModalProps) {
    return <UserDetailsWorkspace user={user} modal={false} />;
}

export function UserDetailsModal({ user }: UserDetailsModalProps) {
    const router = useRouter();

    return (
        <ModalRoot isOpen={true} onClose={() => router.back()} contentClassName="max-w-4xl">
            <div role="dialog" aria-modal="true" aria-label={`Detalhes do usuário ${user.name}`} className="max-h-[calc(100dvh-2rem)] w-full overscroll-contain overflow-y-auto rounded-xl bg-j-gray-100 shadow-2xl [webkit-overflow-scrolling:touch]">
                <UserDetailsWorkspace user={user} modal />
            </div>
        </ModalRoot>
    );
}

function UserDetailsWorkspace({ user: initialUser, modal }: UserDetailsModalProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { setContent, setOpen } = useModal();
    const [currentUser, setCurrentUser] = useState<AdminUser>(initialUser);

    useEffect(() => {
        setCurrentUser(initialUser);
    }, [initialUser]);

    const permissions = useUserStore((state) => state.permissions);
    const canReadUsers = hasPermission(permissions, "IDENTITY", "USER_READ");
    const canUpdateUsers = hasPermission(permissions, "IDENTITY", "USER_UPDATE");
    const canDisableUsers = hasPermission(permissions, "IDENTITY", "USER_DISABLE");
    const canEnableUsers = hasPermission(permissions, "IDENTITY", "USER_ENABLE");
    const canArchiveUsers = hasPermission(permissions, "IDENTITY", "USER_ARCHIVE");
    const canUnarchiveUsers = hasPermission(permissions, "IDENTITY", "USER_UNARCHIVE");
    const canDeleteUsers = hasPermission(permissions, "IDENTITY", "USER_DELETE");
    const canReadUserHistory = hasPermission(permissions, "IDENTITY", "USER_HISTORY_READ");
    const canReadUserRoles = hasPermission(permissions, "AUTHORIZATION", "USER_ROLE_READ");
    const canManageInvitations = hasPermission(permissions, "IDENTITY", "USER_CREATE");
    const canReadSecurity = hasAdminSecurityReadPermission(permissions);

    const [selected, setSelected] = useState(() =>
        typeof window !== "undefined" && window.location.search.includes("invitation=1") && canManageInvitations
            ? "access"
            : typeof window !== "undefined" && window.location.hash === "#roles" && canReadUserRoles ? "roles" : "personal",
    );

    const options = useMemo<UserWorkspaceOption[]>(() => {
        const base: UserWorkspaceOption[] = [
            { key: "personal", label: "Dados", description: "Identificação, contato e ficha complementar", icon: UserRound },
            { key: "access", label: "Acesso", description: "Situação, ciclo de vida e histórico", icon: LockKeyhole },
        ];
        if (canReadUserRoles) base.push({ key: "roles", label: "Cargos", description: "Papéis de acesso do usuário", icon: ShieldCheck });
        if (canReadSecurity) base.push({ key: "security", label: "Segurança", description: "Sessões, tokens e recuperação de senha", icon: LockKeyhole });
        return base;
    }, [canReadSecurity, canReadUserRoles]);

    function handleUserUpdated(updated: AdminUser) {
        setCurrentUser(updated);
        queryClient.setQueryData(["admin-users", "details", updated.id], updated);
        void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    }

    function openLifecycleModal(action: AdminUserLifecycleAction) {
        setContent(
            <UserStatusConfirmationModal
                user={currentUser}
                action={action}
                onConfirm={(userId, statusAction) => patchUserStatusAction({ userId, status: statusAction })}
                onSuccess={handleUserUpdated}
            />,
        );
        setOpen();
    }

    return (
        <UserWorkspace
            title="Detalhes do usuário"
            description="Informações da conta, ficha complementar, permissões e segurança."
            options={options}
            selected={selected}
            onSelect={setSelected}
            summary={(
                <div className="flex items-center gap-3 bg-j-blue-800 px-4 py-5 sm:px-6">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-j-white/10 text-j-yellow-300">
                        <UserRound size={22} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="break-words text-base font-bold text-j-white">{currentUser.name}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-j-yellow-300">
                                Matrícula: {currentUser.membershipNumber ?? "Não associada"}
                            </span>
                            <span className="text-xs text-j-white/70">ID #{currentUser.id}</span>
                            <span className={twMerge("rounded-full px-2 py-0.5 text-xs font-semibold", USER_STATUS_STYLE[currentUser.status])}>
                                {USER_STATUS_LABEL[currentUser.status]}
                            </span>
                        </div>
                    </div>
                </div>
            )}
            onBack={() => modal ? router.back() : router.push("/admin/users")}
        >
            <div className="p-4 sm:p-6">
                {selected === "personal" && (
                    <div className="flex flex-col gap-6">
                        <UserBasicRegistrationSection
                            user={currentUser}
                            canUpdate={canUpdateUsers && currentUser.status !== "ARCHIVED"}
                            onUpdated={handleUserUpdated}
                        />
                        {canReadUsers && (
                            <UserComplementaryProfileSection
                                userId={currentUser.id}
                                canUpdate={canUpdateUsers && currentUser.status !== "ARCHIVED"}
                            />
                        )}
                    </div>
                )}
                {selected === "access" && (
                    <UserAccessAndLifecycleSection
                        user={currentUser}
                        canManageInvitations={canManageInvitations}
                        canDisableUsers={canDisableUsers}
                        canEnableUsers={canEnableUsers}
                        canArchiveUsers={canArchiveUsers}
                        canUnarchiveUsers={canUnarchiveUsers}
                        canDeleteUsers={canDeleteUsers}
                        canReadUserHistory={canReadUserHistory}
                        onLifecycleAction={openLifecycleModal}
                        onDeleted={() => {
                            void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
                            if (modal) {
                                router.back();
                            } else {
                                router.push("/admin/users");
                            }
                        }}
                    />
                )}
                {selected === "roles" && canReadUserRoles && <UserRolesPanel userId={currentUser.id} userName={currentUser.name} />}
                {selected === "security" && canReadSecurity && <UserSecurityTab userId={currentUser.id} />}
            </div>
        </UserWorkspace>
    );
}

function UserBasicRegistrationSection({
    user,
    canUpdate,
    onUpdated,
}: {
    user: AdminUser;
    canUpdate: boolean;
    onUpdated: (updated: AdminUser) => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>();

    async function handleSubmit(values: AdminUpdateUserFormData) {
        setIsSaving(true);
        setErrorMessage(undefined);
        try {
            const updated = await updateAdminUserAction(user.id, {
                name: values.name,
                cpf: values.cpf,
                email: values.email || null,
                birthDate: values.birthDate || null,
                rg: values.rg || null,
                phoneNumber: values.phoneNumber || null,
            });
            onUpdated(updated);
            setIsEditing(false);
            toast.success("Dados básicos do usuário atualizados com sucesso!");
        } catch (error) {
            const message = extractApiErrorMessage(error, "Não foi possível atualizar os dados básicos do usuário.");
            setErrorMessage(message);
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <section aria-label="Dados cadastrais básicos" className="rounded-xl border border-j-gray-200 bg-j-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-j-gray-100 pb-3">
                <div>
                    <h3 className="text-sm font-bold text-j-blue-800 md:text-base">Dados cadastrais básicos</h3>
                    <p className="text-xs text-j-gray-500">Identificação civil, matrícula e canais de contato do associado.</p>
                </div>
                {canUpdate && !isEditing && (
                    <Button
                        type="button"
                        onClick={() => {
                            setErrorMessage(undefined);
                            setIsEditing(true);
                        }}
                        className="h-9 gap-1.5 px-3 text-xs"
                    >
                        <Pencil size={14} />
                        Editar dados básicos
                    </Button>
                )}
            </div>

            {!isEditing ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <ReadOnlyField {...fieldStyle} label="Matrícula do sócio" value={user.membershipNumber ?? "Não associada"} />
                    <ReadOnlyField {...fieldStyle} label="ID técnico" value={`#${user.id}`} />
                    <ReadOnlyField {...fieldStyle} label="CPF" value={maskCPF(user.cpf)} />
                    <ReadOnlyField {...fieldStyle} label="RG" value={user.rg ?? "—"} />
                    <ReadOnlyField {...fieldStyle} label="Data de nascimento" value={user.birthDate ? maskDate(user.birthDate) : "—"} />
                    <ReadOnlyField {...fieldStyle} label="E-mail" value={user.email ?? "—"} />
                    <ReadOnlyField {...fieldStyle} label="Telefone" value={user.phoneNumber ? maskPhoneNumber(user.phoneNumber) : "—"} />
                </div>
            ) : (
                <Form<AdminUpdateUserFormData>
                    schema={adminUpdateUserFormSchema}
                    onSubmit={handleSubmit}
                    onError={() => undefined}
                    formOptions={{
                        defaultValues: {
                            name: user.name ?? "",
                            cpf: maskCPF(user.cpf ?? ""),
                            email: user.email ?? "",
                            birthDate: user.birthDate ?? "",
                            rg: user.rg ?? "",
                            phoneNumber: user.phoneNumber ? maskPhoneNumber(user.phoneNumber) : "",
                        },
                    }}
                    className="items-stretch gap-4"
                >
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                        <strong>Atenção:</strong> A alteração de <strong>CPF</strong> ou <strong>e-mail</strong> revoga automaticamente sessões e refresh tokens ativos do usuário e invalida links pendentes enviados ao e-mail anterior.
                    </div>

                    {errorMessage && (
                        <p role="alert" className="rounded-lg border border-j-red-200 bg-j-red-50 p-3 text-xs font-medium text-j-red-700">
                            {errorMessage}
                        </p>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Input.Register
                            name="name"
                            label="Nome completo *"
                            placeholder="Nome completo do usuário"
                            labelClassName="text-xs font-bold text-j-gray-700"
                        />
                        <Input.Register
                            name="cpf"
                            label="CPF *"
                            placeholder="000.000.000-00"
                            mask={maskCPF}
                            inputMode="numeric"
                            labelClassName="text-xs font-bold text-j-gray-700"
                        />
                        <Input.Register
                            name="rg"
                            label="RG (apenas dígitos)"
                            placeholder="Somente números"
                            inputMode="numeric"
                            labelClassName="text-xs font-bold text-j-gray-700"
                        />
                        <Input.Register
                            name="birthDate"
                            type="date"
                            label="Data de nascimento"
                            labelClassName="text-xs font-bold text-j-gray-700"
                        />
                        <Input.Register
                            name="email"
                            type="email"
                            label="E-mail"
                            placeholder="usuario@exemplo.com"
                            labelClassName="text-xs font-bold text-j-gray-700"
                        />
                        <Input.Register
                            name="phoneNumber"
                            label="Telefone"
                            placeholder="(00) 00000-0000"
                            mask={maskPhoneNumber}
                            inputMode="numeric"
                            labelClassName="text-xs font-bold text-j-gray-700"
                        />
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            disabled={isSaving}
                            onClick={() => setIsEditing(false)}
                            className="h-9 bg-j-gray-200 px-3 text-xs text-j-gray-700 hover:bg-j-gray-300"
                        >
                            <X size={14} />
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSaving} className="h-9 px-4 text-xs">
                            {isSaving ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />}
                            {isSaving ? "Salvando..." : "Salvar alterações"}
                        </Button>
                    </div>
                </Form>
            )}
        </section>
    );
}

function UserComplementaryProfileSection({
    userId,
    canUpdate,
}: {
    userId: number;
    canUpdate: boolean;
}) {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>();

    const { data: profile, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ["admin-users", "details", userId, "complementary-profile"],
        queryFn: () => getAdminUserProfileAction(userId),
        retry: false,
    });

    async function handleSubmit(values: AdminUserComplementaryProfileFormData) {
        setIsSaving(true);
        setErrorMessage(undefined);
        try {
            const updated = await replaceAdminUserProfileAction(userId, {
                workProfile: {
                    occupation: values.occupation?.trim() || null,
                    workplace: values.workplace?.trim() || null,
                },
                address: {
                    postalCode: values.postalCode ? values.postalCode.replace(/\D/g, "") || null : null,
                    street: values.street?.trim() || null,
                    number: values.number?.trim() || null,
                    complement: values.complement?.trim() || null,
                    neighborhood: values.neighborhood?.trim() || null,
                    city: values.city?.trim() || null,
                    state: values.state ? values.state.trim().toUpperCase() || null : null,
                },
            });
            queryClient.setQueryData(["admin-users", "details", userId, "complementary-profile"], updated);
            setIsEditing(false);
            toast.success("Ficha complementar atualizada com sucesso!");
        } catch (saveError) {
            const message = extractApiErrorMessage(saveError, "Não foi possível salvar a ficha complementar.");
            setErrorMessage(message);
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <section aria-label="Ficha cadastral complementar" className="rounded-xl border border-j-gray-200 bg-j-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-j-gray-100 pb-3">
                <div className="flex flex-wrap items-center gap-2.5">
                    <BriefcaseBusiness size={18} className="text-j-blue-800" />
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-j-blue-800 md:text-base">Ficha cadastral complementar</h3>
                            {profile && (
                                <span
                                    className={twMerge(
                                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                                        profile.profileCompletionPending
                                            ? "bg-amber-100 text-amber-800"
                                            : "bg-j-green-100 text-j-green-700",
                                    )}
                                >
                                    <CheckCircle2 size={12} />
                                    {profile.profileCompletionPending ? "Preenchimento pendente" : "Ficha completa"}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-j-gray-500">Dados profissionais e endereço residencial do associado.</p>
                    </div>
                </div>
                {canUpdate && profile && !isEditing && (
                    <Button
                        type="button"
                        onClick={() => {
                            setErrorMessage(undefined);
                            setIsEditing(true);
                        }}
                        className="h-9 gap-1.5 px-3 text-xs"
                    >
                        <Pencil size={14} />
                        Editar ficha complementar
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-j-gray-500">
                    <LoaderCircle size={18} className="animate-spin" />
                    Carregando ficha complementar...
                </div>
            ) : error || !profile ? (
                <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
                    <p className="text-xs text-j-gray-600">
                        {extractApiErrorMessage(error, "Não foi possível carregar a ficha complementar do usuário.")}
                    </p>
                    <Button type="button" onClick={() => void refetch()} disabled={isFetching} className="h-8 px-3 text-xs">
                        {isFetching ? "Tentando novamente..." : "Tentar novamente"}
                    </Button>
                </div>
            ) : !isEditing ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <ReadOnlyField {...fieldStyle} label="Profissão / Ocupação" value={profile.workProfile?.occupation ?? "—"} />
                    <ReadOnlyField {...fieldStyle} label="Empresa / Local de trabalho" value={profile.workProfile?.workplace ?? "—"} />
                    <ReadOnlyField {...fieldStyle} label="CEP residencial" value={profile.address?.postalCode ? maskCEP(profile.address.postalCode) : "—"} />
                    <ReadOnlyField {...fieldStyle} label="Logradouro" value={profile.address?.street ?? "—"} />
                    <ReadOnlyField {...fieldStyle} label="Número" value={profile.address?.number ?? "—"} />
                    <ReadOnlyField {...fieldStyle} label="Complemento" value={profile.address?.complement ?? "—"} />
                    <ReadOnlyField {...fieldStyle} label="Bairro" value={profile.address?.neighborhood ?? "—"} />
                    <ReadOnlyField
                        {...fieldStyle}
                        label="Cidade / UF"
                        value={
                            profile.address?.city || profile.address?.state
                                ? [profile.address?.city, profile.address?.state].filter(Boolean).join(" / ")
                                : "—"
                        }
                    />
                </div>
            ) : (
                <Form<AdminUserComplementaryProfileFormData>
                    schema={adminUserComplementaryProfileFormSchema}
                    onSubmit={handleSubmit}
                    onError={() => undefined}
                    formOptions={{
                        defaultValues: {
                            occupation: profile.workProfile?.occupation ?? "",
                            workplace: profile.workProfile?.workplace ?? "",
                            postalCode: profile.address?.postalCode ? maskCEP(profile.address.postalCode) : "",
                            street: profile.address?.street ?? "",
                            number: profile.address?.number ?? "",
                            complement: profile.address?.complement ?? "",
                            neighborhood: profile.address?.neighborhood ?? "",
                            city: profile.address?.city ?? "",
                            state: profile.address?.state ?? "",
                        },
                    }}
                    className="items-stretch gap-4"
                >
                    {errorMessage && (
                        <p role="alert" className="rounded-lg border border-j-red-200 bg-j-red-50 p-3 text-xs font-medium text-j-red-700">
                            {errorMessage}
                        </p>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Input.Register
                            name="occupation"
                            label="Profissão / Ocupação"
                            placeholder="Ex.: Engenheiro"
                            labelClassName="text-xs font-bold text-j-gray-700"
                        />
                        <Input.Register
                            name="workplace"
                            label="Empresa / Local de trabalho"
                            placeholder="Nome da empresa ou organização"
                            labelClassName="text-xs font-bold text-j-gray-700"
                        />
                        <Input.Register
                            name="postalCode"
                            label="CEP residencial"
                            placeholder="00000-000"
                            mask={maskCEP}
                            inputMode="numeric"
                            labelClassName="text-xs font-bold text-j-gray-700"
                        />
                        <Input.Register
                            name="street"
                            label="Logradouro"
                            placeholder="Rua, Avenida..."
                            labelClassName="text-xs font-bold text-j-gray-700"
                        />
                        <Input.Register
                            name="number"
                            label="Número"
                            placeholder="Nº ou S/N"
                            labelClassName="text-xs font-bold text-j-gray-700"
                        />
                        <Input.Register
                            name="complement"
                            label="Complemento"
                            placeholder="Apto, Bloco..."
                            labelClassName="text-xs font-bold text-j-gray-700"
                        />
                        <Input.Register
                            name="neighborhood"
                            label="Bairro"
                            placeholder="Bairro"
                            labelClassName="text-xs font-bold text-j-gray-700"
                        />
                        <Input.Register
                            name="city"
                            label="Cidade"
                            placeholder="Cidade"
                            labelClassName="text-xs font-bold text-j-gray-700"
                        />
                        <Select.Register
                            name="state"
                            label="UF"
                            labelClassName="text-xs font-bold text-j-gray-700"
                            className="border border-j-gray-300 bg-j-white text-j-gray-700"
                        >
                            <option value="">Selecione a UF</option>
                            {BRAZILIAN_STATES.map((uf) => (
                                <option key={uf} value={uf}>
                                    {uf}
                                </option>
                            ))}
                        </Select.Register>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            disabled={isSaving}
                            onClick={() => setIsEditing(false)}
                            className="h-9 bg-j-gray-200 px-3 text-xs text-j-gray-700 hover:bg-j-gray-300"
                        >
                            <X size={14} />
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSaving} className="h-9 px-4 text-xs">
                            {isSaving ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />}
                            {isSaving ? "Salvando..." : "Salvar ficha complementar"}
                        </Button>
                    </div>
                </Form>
            )}
        </section>
    );
}

function UserAccessAndLifecycleSection({
    user,
    canManageInvitations,
    canDisableUsers,
    canEnableUsers,
    canArchiveUsers,
    canUnarchiveUsers,
    canDeleteUsers,
    canReadUserHistory,
    onLifecycleAction,
    onDeleted,
}: {
    user: AdminUser;
    canManageInvitations: boolean;
    canDisableUsers: boolean;
    canEnableUsers: boolean;
    canArchiveUsers: boolean;
    canUnarchiveUsers: boolean;
    canDeleteUsers: boolean;
    canReadUserHistory: boolean;
    onLifecycleAction: (action: AdminUserLifecycleAction) => void;
    onDeleted: () => void;
}) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmHardDelete, setConfirmHardDelete] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const { data: deletionHistory, isLoading: isLoadingHistory, error: historyError } = useQuery({
        queryKey: ["admin-users", "details", user.id, "deletion-history"],
        queryFn: () => getAdminUserDeletionHistoryAction(user.id),
        enabled: canReadUserHistory && showHistory,
        retry: false,
    });

    async function handleHardDelete() {
        setIsDeleting(true);
        try {
            await deleteAdminUserAction(user.id);
            toast.success("Cadastro pendente excluído definitivamente.");
            onDeleted();
        } catch (error) {
            toast.error(extractApiErrorMessage(error, "Não foi possível excluir este usuário."));
            setConfirmHardDelete(false);
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <section aria-label="Conta e acesso" className="grid grid-cols-1 gap-5 rounded-xl border border-j-gray-200 bg-j-white p-4 shadow-sm sm:grid-cols-2 sm:p-5">
                <div className="flex flex-col items-start gap-2">
                    <span className="text-xs font-medium text-j-gray-500">Status da conta</span>
                    <span className={twMerge("rounded-full px-3 py-1 text-xs font-bold", USER_STATUS_STYLE[user.status])}>
                        {USER_STATUS_LABEL[user.status]}
                    </span>
                </div>
                <ReadOnlyField {...fieldStyle} label="Data de inativação / arquivamento" value={maskDate(user.disabledAt)} />
                <ReadOnlyField {...fieldStyle} label="Data de cadastro" value={maskDate(user.createdAt)} />
                <ReadOnlyField {...fieldStyle} label="Última atualização" value={maskDate(user.updatedAt)} />

                {(canDisableUsers || canEnableUsers || canArchiveUsers || canUnarchiveUsers || canDeleteUsers) && (
                    <div className="col-span-full border-t border-j-gray-100 pt-4">
                        <span className="mb-2.5 block text-xs font-bold text-j-gray-700">Ações de ciclo de vida</span>
                        <div className="flex flex-wrap items-center gap-2">
                            {user.status === "ACTIVE" && canDisableUsers && (
                                <Button
                                    type="button"
                                    onClick={() => onLifecycleAction("disable")}
                                    className="h-9 bg-j-red-500 px-3 text-xs text-white hover:bg-j-red-600"
                                >
                                    <PowerOff size={14} />
                                    Inativar usuário
                                </Button>
                            )}
                            {user.status === "INACTIVE" && canEnableUsers && (
                                <Button
                                    type="button"
                                    onClick={() => onLifecycleAction("enable")}
                                    className="h-9 bg-j-green-700 px-3 text-xs text-white hover:bg-j-green-600"
                                >
                                    <Power size={14} />
                                    Reativar usuário
                                </Button>
                            )}
                            {user.status !== "ARCHIVED" && canArchiveUsers && (
                                <Button
                                    type="button"
                                    onClick={() => onLifecycleAction("archive")}
                                    className="h-9 bg-amber-600 px-3 text-xs text-white hover:bg-amber-700"
                                >
                                    <Archive size={14} />
                                    Arquivar usuário
                                </Button>
                            )}
                            {user.status === "ARCHIVED" && canUnarchiveUsers && (
                                <Button
                                    type="button"
                                    onClick={() => onLifecycleAction("unarchive")}
                                    className="h-9 bg-j-blue-800 px-3 text-xs text-j-yellow-300 hover:bg-j-blue-700"
                                >
                                    <ArchiveRestore size={14} />
                                    Desarquivar usuário
                                </Button>
                            )}
                            {canDeleteUsers && !confirmHardDelete && (
                                <Button
                                    type="button"
                                    onClick={() => setConfirmHardDelete(true)}
                                    className="h-9 border border-j-red-300 bg-j-white px-3 text-xs text-j-red-600 hover:bg-j-red-50"
                                >
                                    <Trash2 size={14} />
                                    Excluir cadastro pendente
                                </Button>
                            )}
                        </div>

                        {confirmHardDelete && (
                            <div className="mt-3 rounded-xl border border-j-red-200 bg-j-red-50 p-4">
                                <p className="text-xs font-bold text-j-red-800">
                                    Confirmar exclusão física definitiva de {user.name}?
                                </p>
                                <p className="mt-1 text-xs text-j-red-700">
                                    A exclusão física só é permitida para cadastros que ainda estão com primeiro acesso pendente e sem vínculos impeditivos. Para usuários já ativados, utilize Inativar ou Arquivar.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        disabled={isDeleting}
                                        onClick={() => setConfirmHardDelete(false)}
                                        className="h-8 bg-j-white px-3 text-xs text-j-gray-700 hover:bg-j-gray-100"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="button"
                                        disabled={isDeleting}
                                        onClick={() => void handleHardDelete()}
                                        className="h-8 bg-j-red-600 px-3 text-xs text-white hover:bg-j-red-700"
                                    >
                                        {isDeleting ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                        {isDeleting ? "Excluindo..." : "Confirmar exclusão"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {canManageInvitations && user.email && <UserActivationInvitation userId={user.id} userStatus={user.status} />}

                {canReadUserHistory && (
                    <div className="col-span-full border-t border-j-gray-100 pt-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold text-j-gray-700">Auditoria de exclusão física</span>
                            <Button
                                type="button"
                                onClick={() => setShowHistory((prev) => !prev)}
                                className="h-8 bg-j-gray-100 px-3 text-xs text-j-blue-800 hover:bg-j-gray-200"
                            >
                                <History size={14} />
                                {showHistory ? "Ocultar histórico" : "Consultar histórico de exclusão"}
                            </Button>
                        </div>

                        {showHistory && (
                            <div className="mt-3 rounded-lg border border-j-gray-200 bg-j-gray-50 p-3 text-xs">
                                {isLoadingHistory ? (
                                    <span className="flex items-center gap-2 text-j-gray-500">
                                        <LoaderCircle size={14} className="animate-spin" />
                                        Consultando histórico...
                                    </span>
                                ) : historyError ? (
                                    <span className="text-j-gray-600">
                                        Nenhum registro de exclusão física encontrado para o ID #{user.id}.
                                    </span>
                                ) : deletionHistory ? (
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                                        <div>
                                            <span className="block font-semibold text-j-gray-500">Usuário excluído</span>
                                            <span className="font-bold text-j-gray-800">#{deletionHistory.originalId}</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-j-gray-500">Status anterior</span>
                                            <span className="font-bold text-j-gray-800">{USER_STATUS_LABEL[deletionHistory.previousStatus]}</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-j-gray-500">Administrador responsável</span>
                                            <span className="font-bold text-j-gray-800">
                                                {deletionHistory.deletedByUserId ? `#${deletionHistory.deletedByUserId}` : "Sistema"}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-j-gray-500">Data da exclusão</span>
                                            <span className="font-bold text-j-gray-800">{maskDate(deletionHistory.deletedAt)}</span>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}

function UserRolesPanel({ userId, userName }: { userId: number; userName: string }) {
    const { setContent, setOpen } = useModal();
    const permissions = useUserStore((state) => state.permissions);
    const canAssign = hasPermission(permissions, "AUTHORIZATION", "USER_ROLE_ASSIGN");
    const { data: roles, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ["authorization", "users", userId, "roles"],
        queryFn: () => listUserRolesAction(userId),
        retry: false,
    });

    return (
        <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs font-bold text-j-gray-700 md:text-sm">Cargos atribuídos</span>
                {canAssign && (
                    <Button
                        type="button"
                        disabled={isLoading || !roles}
                        onClick={() => {
                            setContent(<AddUserRoleModal userId={userId} userName={userName} currentRoleIds={roles?.map((role) => role.id) ?? []} />);
                            setOpen();
                        }}
                        className="w-full sm:w-auto"
                    >
                        <Plus size={16} strokeWidth={3} />
                        Adicionar cargo
                    </Button>
                )}
            </div>
            {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-j-gray-500"><LoaderCircle size={20} className="animate-spin" />Carregando cargos...</div>
            ) : error || !roles ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                    <AlertCircle size={34} className="text-red-500" />
                    <p className="max-w-md text-sm text-j-gray-600">{extractApiErrorMessage(error, "Não foi possível carregar os cargos do usuário.")}</p>
                    <Button type="button" onClick={() => void refetch()} disabled={isFetching}>
                        {isFetching ? "Tentando novamente..." : "Tentar novamente"}
                    </Button>
                </div>
            ) : (
                <UserRoles roles={roles} />
            )}
        </section>
    );
}

export function UserRoles({ roles }: { roles: RoleListResponse }) {
    useEffect(() => {
        if (typeof window !== "undefined" && window.location.hash === "#roles") {
            const element = document.getElementById("roles");
            if (element) setTimeout(() => element.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
        }
    }, []);

    return (
        <div id="roles" className="flex scroll-mt-24 flex-col gap-2">
            {roles.length > 0 ? (
                <div className="flex flex-col gap-3">
                    {roles.map((role) => (
                        <div key={role.id} className="flex flex-col gap-1 rounded-xl border border-j-gray-200 bg-j-white p-4 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm font-bold text-j-blue-800 md:text-base">{role.name}</span>
                                <span className={twMerge("rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider", role.status === "ACTIVE" ? "bg-j-green-100 text-j-green-700" : "bg-j-gray-200 text-j-gray-600")}>
                                    {ROLE_STATUS_LABEL[role.status] || role.status}
                                </span>
                            </div>
                            <span className="text-xs leading-relaxed text-j-gray-500 md:text-sm">{role.description}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <span className="text-sm italic text-j-gray-400">Nenhum papel de acesso vinculado a este usuário.</span>
            )}
        </div>
    );
}

