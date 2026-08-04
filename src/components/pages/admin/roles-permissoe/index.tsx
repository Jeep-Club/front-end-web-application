"use client";

import {
    type FormEvent,
    type ReactNode,
} from "react";

import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
    type ReactNode,
} from "react";

import {
    CalendarDays,
    Eye,
    HeartPulse,
    KeyRound,
    Plus,
    Search,
    ShieldCheck,
    UserCog,
    Users,
    WalletCards,
    X,
    type LucideIcon,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";

interface PermissionOption {
    code: string;
    label: string;
    description: string;
}

interface PermissionGroup {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    permissions: PermissionOption[];
}

interface AccessRole {
    id: string;
    name: string;
    description?: string;
    permissions: string[];
}

interface AdminUser {
    id: string;
    name: string;
    registration?: string;
    roleId?: string;
}

type ModalType =
    | "create-role"
    | "roles"
    | "permissions"
    | "change-admin-role"
    | null;

/*
 * Esses são os acessos exibidos na interface.
 * Depois os códigos podem ser substituídos ou carregados pela API.
 */
const permissionGroups: PermissionGroup[] = [
    {
        id: "members",
        title: "Membros",
        description: "Controle de usuários e membros do clube.",
        icon: Users,
        permissions: [
            {
                code: "AUTHENTICATION_USER_READ",
                label: "Visualizar membros",
                description:
                    "Permite consultar os membros cadastrados.",
            },
            {
                code: "AUTHENTICATION_USER_CREATE",
                label: "Cadastrar membros",
                description:
                    "Permite cadastrar novos membros no sistema.",
            },
            {
                code: "AUTHENTICATION_USER_ENABLE",
                label: "Ativar membros",
                description:
                    "Permite reativar o acesso de um membro.",
            },
            {
                code: "AUTHENTICATION_USER_DISABLE",
                label: "Desativar membros",
                description:
                    "Permite bloquear o acesso de um membro.",
            },
        ],
    },
    {
        id: "events",
        title: "Eventos",
        description: "Criação e administração dos eventos.",
        icon: CalendarDays,
        permissions: [
            {
                code: "EVENTS_READ",
                label: "Visualizar eventos",
                description:
                    "Permite consultar eventos cadastrados.",
            },
            {
                code: "EVENTS_CREATE",
                label: "Criar eventos",
                description:
                    "Permite cadastrar novos eventos.",
            },
            {
                code: "EVENTS_UPDATE",
                label: "Editar eventos",
                description:
                    "Permite alterar informações de um evento.",
            },
            {
                code: "EVENTS_CANCEL",
                label: "Cancelar eventos",
                description:
                    "Permite cancelar eventos existentes.",
            },
        ],
    },
    {
        id: "finance",
        title: "Financeiro",
        description: "Cobranças, pagamentos e movimentações.",
        icon: WalletCards,
        permissions: [
            {
                code: "BILLING_CHARGE_DEFINITION_READ",
                label: "Visualizar cobranças",
                description:
                    "Permite consultar cobranças do clube.",
            },
            {
                code: "BILLING_CHARGE_DEFINITION_CREATE",
                label: "Criar cobranças",
                description:
                    "Permite cadastrar novas cobranças.",
            },
            {
                code: "BILLING_PAYMENT_CONFIRM",
                label: "Confirmar pagamentos",
                description:
                    "Permite confirmar o recebimento de pagamentos.",
            },
            {
                code: "BILLING_PAYMENT_REJECT",
                label: "Recusar pagamentos",
                description:
                    "Permite rejeitar um pagamento informado.",
            },
        ],
    },
    {
        id: "medical",
        title: "Dados médicos",
        description: "Acesso às informações médicas dos membros.",
        icon: HeartPulse,
        permissions: [
            {
                code: "HEALTH_MEDICAL_PROFILE_READ",
                label: "Visualizar fichas médicas",
                description:
                    "Permite consultar informações médicas.",
            },
            {
                code: "HEALTH_MEDICAL_PROFILE_UPDATE",
                label: "Editar fichas médicas",
                description:
                    "Permite alterar informações médicas.",
            },
        ],
    },
    {
        id: "authorization",
        title: "Roles e permissões",
        description: "Controle dos acessos administrativos.",
        icon: KeyRound,
        permissions: [
            {
                code: "AUTHORIZATION_ROLE_READ",
                label: "Visualizar roles",
                description:
                    "Permite consultar as roles existentes.",
            },
            {
                code: "AUTHORIZATION_ROLE_CREATE",
                label: "Criar roles",
                description:
                    "Permite cadastrar novas roles.",
            },
            {
                code: "AUTHORIZATION_ROLE_UPDATE",
                label: "Editar roles",
                description:
                    "Permite alterar uma role existente.",
            },
            {
                code: "AUTHORIZATION_USER_ROLE_ASSIGN",
                label: "Atribuir roles",
                description:
                    "Permite definir a role de um administrador.",
            },
            {
                code: "AUTHORIZATION_USER_ROLE_REVOKE",
                label: "Remover roles",
                description:
                    "Permite remover uma role de um administrador.",
            },
            {
                code: "AUTHORIZATION_PERMISSION_ASSIGN",
                label: "Adicionar permissões",
                description:
                    "Permite adicionar acessos a uma role.",
            },
            {
                code: "AUTHORIZATION_PERMISSION_REVOKE",
                label: "Remover permissões",
                description:
                    "Permite retirar acessos de uma role.",
            },
        ],
    },
];

/*
 * Sem usuários ou roles inventados.
 * A API preencherá essas listas.
 */
const initialRoles: AccessRole[] = [];

const initialAdmins: AdminUser[] = [
    {
        id: "mock-admin-supremo",
        name: "Administrador Supremo Mock",
        registration: "0001",
    },
    {
        id: "mock-admin-teste",
        name: "Administrador de Teste",
        registration: "0002",
    },
];

const STORAGE_KEYS = {
    roles: "jeep-club-mock-roles",
    admins: "jeep-club-mock-admins",
} as const;

const allPermissionCodes = permissionGroups.flatMap((group) =>
    group.permissions.map((permission) => permission.code),
);

export default function RolesPermissions() {
    const [admins, setAdmins] =
        useState<AdminUser[]>(initialAdmins);

    const [roles, setRoles] =
        useState<AccessRole[]>(initialRoles);

    const [search, setSearch] = useState("");
    const [modal, setModal] = useState<ModalType>(null);

    const [selectedAdminId, setSelectedAdminId] =
        useState<string | null>(null);

    const [selectedRoleId, setSelectedRoleId] =
        useState<string | null>(null);

    const [draftPermissions, setDraftPermissions] = useState<
        string[]
    >([]);

    const [newRoleName, setNewRoleName] = useState("");
    const [newRoleDescription, setNewRoleDescription] =
        useState("");

    const selectedAdmin = admins.find(
        (admin) => admin.id === selectedAdminId,
    );

    const selectedRole = roles.find(
        (role) => role.id === selectedRoleId,
    );

    const filteredAdmins = useMemo(() => {
        const normalizedSearch = search
            .trim()
            .toLowerCase();

        if (!normalizedSearch) {
            return admins;
        }

        return admins.filter((admin) => {
            const roleName =
                roles.find(
                    (role) => role.id === admin.roleId,
                )?.name ?? "";

            return (
                admin.name
                    .toLowerCase()
                    .includes(normalizedSearch) ||
                admin.registration
                    ?.toLowerCase()
                    .includes(normalizedSearch) ||
                roleName
                    .toLowerCase()
                    .includes(normalizedSearch)
            );
        });
    }, [admins, roles, search]);

    function getRoleName(roleId?: string) {
        if (!roleId) {
            return "Sem role";
        }

        return (
            roles.find((role) => role.id === roleId)?.name ??
            "Role não encontrada"
        );
    }

    function closeModal() {
        setModal(null);
        setSelectedAdminId(null);
        setSelectedRoleId(null);
        setDraftPermissions([]);
    }

    function openRolesModal() {
        setModal("roles");
    }

    function openCreateRoleModal() {
        setNewRoleName("");
        setNewRoleDescription("");
        setModal("create-role");
    }

    function openPermissionsModal(role: AccessRole) {
        setSelectedRoleId(role.id);
        setDraftPermissions([...role.permissions]);
        setModal("permissions");
    }

    function openChangeAdminRoleModal(admin: AdminUser) {
        setSelectedAdminId(admin.id);
        setSelectedRoleId(admin.roleId ?? null);
        setModal("change-admin-role");
    }

    function handleCreateRole(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const name = newRoleName.trim();

        if (!name) {
            return;
        }

        const newRole: AccessRole = {
            id: crypto.randomUUID(),
            name,
            description:
                newRoleDescription.trim() || undefined,
            permissions: [],
        };

        setRoles((currentRoles) => [
            ...currentRoles,
            newRole,
        ]);

        setNewRoleName("");
        setNewRoleDescription("");

        /*
         * Depois de criar, já abre a configuração
         * das permissões da nova role.
         */
        setSelectedRoleId(newRole.id);
        setDraftPermissions([]);
        setModal("permissions");
    }

    function togglePermission(permissionCode: string) {
        setDraftPermissions((currentPermissions) => {
            const isSelected =
                currentPermissions.includes(permissionCode);

            if (isSelected) {
                return currentPermissions.filter(
                    (code) => code !== permissionCode,
                );
            }

            return [
                ...currentPermissions,
                permissionCode,
            ];
        });
    }

    function togglePermissionGroup(
        permissionCodes: string[],
    ) {
        const allSelected = permissionCodes.every((code) =>
            draftPermissions.includes(code),
        );

        if (allSelected) {
            setDraftPermissions((currentPermissions) =>
                currentPermissions.filter(
                    (code) =>
                        !permissionCodes.includes(code),
                ),
            );

            return;
        }

        setDraftPermissions((currentPermissions) => [
            ...new Set([
                ...currentPermissions,
                ...permissionCodes,
            ]),
        ]);
    }

    function selectAllPermissions() {
        setDraftPermissions([...allPermissionCodes]);
    }

    function clearAllPermissions() {
        setDraftPermissions([]);
    }

    function saveRolePermissions() {
        if (!selectedRoleId) {
            return;
        }

        setRoles((currentRoles) =>
            currentRoles.map((role) =>
                role.id === selectedRoleId
                    ? {
                          ...role,
                          permissions: [
                              ...draftPermissions,
                          ],
                      }
                    : role,
            ),
        );

        setModal("roles");
    }

    function saveAdminRole() {
        if (!selectedAdminId) {
            return;
        }

        setAdmins((currentAdmins) =>
            currentAdmins.map((admin) =>
                admin.id === selectedAdminId
                    ? {
                          ...admin,
                          roleId:
                              selectedRoleId ??
                              undefined,
                      }
                    : admin,
            ),
        );

        closeModal();
    }

    return (
        <div className="h-full w-full p-3 md:p-4">
            <div className="flex w-full flex-col gap-4 pb-6">
                <PageHeader
                    title="Roles e permissões"
                    breadcrumbs={[
                        {
                            label: "Início",
                            href: "/feed",
                        },
                        {
                            label: "Painel administrativo",
                            href: "/admin",
                        },
                        {
                            label: "Roles e permissões",
                        },
                    ]}
                />

                <section className="rounded-2xl border border-j-gray-200 bg-j-white p-4 shadow-sm md:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-j-blue-800 text-j-yellow-300">
                                <ShieldCheck size={25} />
                            </div>

                            <div>
                                <h1 className="text-xl font-black text-j-blue-800">
                                    Administradores
                                </h1>

                                <p className="text-sm text-j-gray-600">
                                    Uma role define o que cada
                                    administrador pode acessar e fazer.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={openRolesModal}
                                className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-j-blue-800 px-4 text-sm font-bold text-j-blue-800 transition hover:bg-j-blue-800 hover:text-j-white"
                            >
                                <Eye size={19} />
                                Ver roles
                            </button>

                            <button
                                type="button"
                                onClick={
                                    openCreateRoleModal
                                }
                                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-j-yellow-300 px-4 text-sm font-black text-j-blue-800 transition hover:bg-j-yellow-200"
                            >
                                <Plus size={20} />
                                Criar role
                            </button>
                        </div>
                    </div>

                    <div className="relative mt-6">
                        <Search
                            size={20}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-j-gray-500"
                        />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value,
                                )
                            }
                            placeholder="Pesquisar por nome, matrícula ou role..."
                            className="min-h-14 w-full rounded-xl border border-j-gray-300 bg-j-white pl-12 pr-4 text-base outline-none transition focus:border-j-blue-800"
                        />
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-j-gray-200 p-4 md:px-6">
                        <div>
                            <h2 className="font-black text-j-blue-800">
                                Lista de administradores
                            </h2>

                            <p className="text-sm text-j-gray-600">
                                {filteredAdmins.length} encontrado(s)
                            </p>
                        </div>

                        <Users
                            size={24}
                            className="text-j-gray-400"
                        />
                    </div>

                    {filteredAdmins.length > 0 ? (
                        <>
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full min-w-[720px]">
                                    <thead>
                                        <tr className="border-b border-j-gray-200 bg-j-gray-100 text-left">
                                            <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-j-gray-600">
                                                Administrador
                                            </th>

                                            <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-j-gray-600">
                                                Matrícula
                                            </th>

                                            <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-j-gray-600">
                                                Role atual
                                            </th>

                                            <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wide text-j-gray-600">
                                                Ação
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredAdmins.map(
                                            (admin) => (
                                                <tr
                                                    key={
                                                        admin.id
                                                    }
                                                    className="border-b border-j-gray-200 last:border-0"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-j-blue-800 text-j-white">
                                                                <UserCog
                                                                    size={
                                                                        19
                                                                    }
                                                                />
                                                            </div>

                                                            <span className="font-bold text-j-gray-800">
                                                                {
                                                                    admin.name
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 text-j-gray-700">
                                                        {admin.registration ??
                                                            "Não informada"}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex rounded-lg bg-j-blue-800 px-3 py-2 text-xs font-bold text-j-white">
                                                            {getRoleName(
                                                                admin.roleId,
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openChangeAdminRoleModal(
                                                                    admin,
                                                                )
                                                            }
                                                            className="min-h-11 rounded-lg bg-j-yellow-300 px-4 text-sm font-black text-j-blue-800 transition hover:bg-j-yellow-200"
                                                        >
                                                            Alterar role
                                                        </button>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-col gap-3 p-4 md:hidden">
                                {filteredAdmins.map(
                                    (admin) => (
                                        <article
                                            key={admin.id}
                                            className="rounded-xl border border-j-gray-200 p-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-j-blue-800 text-j-white">
                                                    <UserCog
                                                        size={
                                                            20
                                                        }
                                                    />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate font-black text-j-gray-800">
                                                        {
                                                            admin.name
                                                        }
                                                    </p>

                                                    <p className="text-sm text-j-gray-600">
                                                        Matrícula:{" "}
                                                        {admin.registration ??
                                                            "Não informada"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="my-4 border-t border-j-gray-200" />

                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-xs font-bold uppercase text-j-gray-500">
                                                        Role
                                                    </p>

                                                    <p className="font-bold text-j-blue-800">
                                                        {getRoleName(
                                                            admin.roleId,
                                                        )}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openChangeAdminRoleModal(
                                                            admin,
                                                        )
                                                    }
                                                    className="min-h-11 rounded-lg bg-j-yellow-300 px-4 text-sm font-black text-j-blue-800"
                                                >
                                                    Alterar
                                                </button>
                                            </div>
                                        </article>
                                    ),
                                )}
                            </div>
                        </>
                    ) : (
                        <EmptyState
                            icon={Users}
                            title="Nenhum administrador encontrado"
                            description="Os administradores aparecerão aqui quando forem carregados pela API."
                        />
                    )}
                </section>
            </div>

            {modal === "create-role" && (
                <Modal
                    title="Criar nova role"
                    description="Uma role reúne as permissões que serão entregues aos administradores."
                    onClose={closeModal}
                >
                    <form
                        onSubmit={handleCreateRole}
                        className="flex flex-col gap-4"
                    >
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-j-gray-700">
                                Nome da role
                            </span>

                            <input
                                autoFocus
                                value={newRoleName}
                                onChange={(event) =>
                                    setNewRoleName(
                                        event.target.value,
                                    )
                                }
                                placeholder="Ex.: Administrador de eventos"
                                className="min-h-12 rounded-xl border border-j-gray-300 px-4 text-base outline-none focus:border-j-blue-800"
                            />
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-j-gray-700">
                                Descrição
                            </span>

                            <textarea
                                value={newRoleDescription}
                                onChange={(event) =>
                                    setNewRoleDescription(
                                        event.target.value,
                                    )
                                }
                                placeholder="Explique para que esta role será utilizada."
                                rows={4}
                                className="resize-none rounded-xl border border-j-gray-300 p-4 text-base outline-none focus:border-j-blue-800"
                            />
                        </label>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="min-h-12 rounded-xl border border-j-gray-300 font-bold text-j-gray-700"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={!newRoleName.trim()}
                                className="min-h-12 rounded-xl bg-j-yellow-300 font-black text-j-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Continuar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {modal === "roles" && (
                <Modal
                    title="Roles cadastradas"
                    description="Consulte cada role e defina o que ela pode fazer."
                    onClose={closeModal}
                >
                    {roles.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {roles.map((role) => (
                                <article
                                    key={role.id}
                                    className="rounded-xl border border-j-gray-200 p-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-j-blue-800 text-j-yellow-300">
                                            <KeyRound
                                                size={21}
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-black text-j-blue-800">
                                                {role.name}
                                            </h3>

                                            <p className="mt-1 text-sm text-j-gray-600">
                                                {role.description ??
                                                    "Sem descrição."}
                                            </p>

                                            <p className="mt-2 text-xs font-bold uppercase tracking-wide text-j-gray-500">
                                                {
                                                    role
                                                        .permissions
                                                        .length
                                                }{" "}
                                                permissões
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            openPermissionsModal(
                                                role,
                                            )
                                        }
                                        className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-j-yellow-300 px-4 text-sm font-black text-j-blue-800 transition hover:bg-j-yellow-200"
                                    >
                                        <ShieldCheck
                                            size={19}
                                        />

                                        Gerenciar permissões
                                    </button>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={KeyRound}
                            title="Nenhuma role cadastrada"
                            description="Crie uma role para começar a configurar os acessos."
                            compact
                        />
                    )}
                </Modal>
            )}

            {modal === "permissions" && selectedRole && (
                <Modal
                    title={`Permissões: ${selectedRole.name}`}
                    description="Ative somente as ações que esta role realmente precisa usar."
                    onClose={closeModal}
                    wide
                >
                    <div className="mb-4 flex flex-col gap-3 rounded-xl bg-j-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="font-black text-j-blue-800">
                                {draftPermissions.length} de{" "}
                                {allPermissionCodes.length}{" "}
                                permissões selecionadas
                            </p>

                            <p className="text-sm text-j-gray-600">
                                As alterações só serão aplicadas
                                depois de salvar.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={
                                    selectAllPermissions
                                }
                                className="min-h-11 rounded-lg border border-j-blue-800 px-3 text-xs font-bold text-j-blue-800"
                            >
                                Liberar todas
                            </button>

                            <button
                                type="button"
                                onClick={
                                    clearAllPermissions
                                }
                                className="min-h-11 rounded-lg border border-red-300 px-3 text-xs font-bold text-red-600"
                            >
                                Remover todas
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {permissionGroups.map((group) => {
                            const Icon = group.icon;

                            const groupCodes =
                                group.permissions.map(
                                    (permission) =>
                                        permission.code,
                                );

                            const allGroupSelected =
                                groupCodes.every((code) =>
                                    draftPermissions.includes(
                                        code,
                                    ),
                                );

                            return (
                                <section
                                    key={group.id}
                                    className="overflow-hidden rounded-xl border border-j-gray-200"
                                >
                                    <header className="flex flex-col gap-3 border-b border-j-gray-200 bg-j-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-j-blue-800 text-j-yellow-300">
                                                <Icon
                                                    size={20}
                                                />
                                            </div>

                                            <div>
                                                <h3 className="font-black text-j-blue-800">
                                                    {
                                                        group.title
                                                    }
                                                </h3>

                                                <p className="text-sm text-j-gray-600">
                                                    {
                                                        group.description
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                togglePermissionGroup(
                                                    groupCodes,
                                                )
                                            }
                                            className="min-h-10 rounded-lg border border-j-gray-300 bg-j-white px-3 text-xs font-bold text-j-blue-800"
                                        >
                                            {allGroupSelected
                                                ? "Remover área"
                                                : "Liberar área"}
                                        </button>
                                    </header>

                                    <div className="divide-y divide-j-gray-200">
                                        {group.permissions.map(
                                            (permission) => {
                                                const checked =
                                                    draftPermissions.includes(
                                                        permission.code,
                                                    );

                                                return (
                                                    <label
                                                        key={
                                                            permission.code
                                                        }
                                                        className="flex min-h-20 cursor-pointer items-center justify-between gap-4 p-4 transition hover:bg-j-gray-100"
                                                    >
                                                        <div>
                                                            <p className="font-bold text-j-gray-800">
                                                                {
                                                                    permission.label
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-sm text-j-gray-600">
                                                                {
                                                                    permission.description
                                                                }
                                                            </p>
                                                        </div>

                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                checked
                                                            }
                                                            onChange={() =>
                                                                togglePermission(
                                                                    permission.code,
                                                                )
                                                            }
                                                            className="sr-only"
                                                        />

                                                        <span
                                                            className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                                                                checked
                                                                    ? "bg-j-blue-800"
                                                                    : "bg-j-gray-300"
                                                            }`}
                                                        >
                                                            <span
                                                                className={`absolute top-1 h-5 w-5 rounded-full bg-j-white shadow-sm transition-all ${
                                                                    checked
                                                                        ? "left-6"
                                                                        : "left-1"
                                                                }`}
                                                            />
                                                        </span>
                                                    </label>
                                                );
                                            },
                                        )}
                                    </div>
                                </section>
                            );
                        })}
                    </div>

                    <div className="sticky bottom-0 mt-5 grid grid-cols-2 gap-2 border-t border-j-gray-200 bg-j-white pt-4">
                        <button
                            type="button"
                            onClick={() =>
                                setModal("roles")
                            }
                            className="min-h-12 rounded-xl border border-j-gray-300 font-bold text-j-gray-700"
                        >
                            Voltar
                        </button>

                        <button
                            type="button"
                            onClick={
                                saveRolePermissions
                            }
                            className="min-h-12 rounded-xl bg-j-yellow-300 font-black text-j-blue-800"
                        >
                            Salvar permissões
                        </button>
                    </div>
                </Modal>
            )}

            {modal === "change-admin-role" &&
                selectedAdmin && (
                    <Modal
                        title="Alterar role"
                        description={`Escolha a role administrativa de ${selectedAdmin.name}.`}
                        onClose={closeModal}
                    >
                        {roles.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-bold text-j-gray-700">
                                        Role administrativa
                                    </span>

                                    <select
                                        value={
                                            selectedRoleId ?? ""
                                        }
                                        onChange={(event) =>
                                            setSelectedRoleId(
                                                event.target
                                                    .value ||
                                                    null,
                                            )
                                        }
                                        className="min-h-12 rounded-xl border border-j-gray-300 bg-j-white px-4 text-base outline-none focus:border-j-blue-800"
                                    >
                                        <option value="">
                                            Sem role
                                        </option>

                                        {roles.map((role) => (
                                            <option
                                                key={role.id}
                                                value={role.id}
                                            >
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="min-h-12 rounded-xl border border-j-gray-300 font-bold text-j-gray-700"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={saveAdminRole}
                                        className="min-h-12 rounded-xl bg-j-yellow-300 font-black text-j-blue-800"
                                    >
                                        Salvar role
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <EmptyState
                                icon={KeyRound}
                                title="Nenhuma role disponível"
                                description="Crie uma role antes de atribuí-la a um administrador."
                                compact
                            />
                        )}
                    </Modal>
                )}
        </div>
    );
}

interface ModalProps {
    title: string;
    description?: string;
    children: ReactNode;
    onClose: () => void;
    wide?: boolean;
}

function Modal({
    title,
    description,
    children,
    onClose,
    wide = false,
}: ModalProps) {
    return (
        <div
            role="presentation"
            onMouseDown={onClose}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
                className={`max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-j-white p-5 shadow-xl sm:rounded-2xl sm:p-6 ${
                    wide
                        ? "sm:max-w-4xl"
                        : "sm:max-w-xl"
                }`}
            >
                <header className="mb-5 flex items-start justify-between gap-4 border-b border-j-gray-200 pb-4">
                    <div>
                        <h2 className="text-xl font-black text-j-blue-800">
                            {title}
                        </h2>

                        {description && (
                            <p className="mt-1 text-sm text-j-gray-600">
                                {description}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-j-gray-200 text-j-gray-600 transition hover:bg-j-gray-100"
                    >
                        <X size={21} />
                    </button>
                </header>

                {children}
            </section>
        </div>
    );
}

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    compact?: boolean;
}

function EmptyState({
    icon: Icon,
    title,
    description,
    compact = false,
}: EmptyStateProps) {
    return (
        <div
            className={`flex flex-col items-center justify-center p-8 text-center ${
                compact
                    ? "min-h-48 rounded-xl border border-dashed border-j-gray-300"
                    : "min-h-72"
            }`}
        >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-j-gray-100 text-j-gray-400">
                <Icon size={31} />
            </div>

            <h3 className="text-lg font-black text-j-blue-800">
                {title}
            </h3>

            <p className="mt-1 max-w-md text-sm text-j-gray-600">
                {description}
            </p>
        </div>
    );
}