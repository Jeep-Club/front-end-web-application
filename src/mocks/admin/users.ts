import type {
    AdminRole,
    AdminUsersDataSource,
    UserListItem,
    UserListQuery,
} from "@/types/admin/users";

export interface MockAdminUsersOptions {
    delay?: number;
    emptyList?: boolean;
    failList?: boolean;
    failRoleCatalog?: boolean;
    failDetailsForId?: number;
    failStatusForId?: number;
    failRolesForId?: number;
}

const roles: AdminRole[] = [
    {
        id: 1,
        name: "Administrador",
        description: "Acesso administrativo amplo.",
        status: "ACTIVE",
        createdAt: "2024-01-10T12:00:00.000Z",
        updatedAt: "2025-03-18T14:30:00.000Z",
        deletedAt: null,
    },
    {
        id: 2,
        name: "Atendimento",
        description: "Consulta e suporte aos associados.",
        status: "ACTIVE",
        createdAt: "2024-02-15T12:00:00.000Z",
        updatedAt: null,
        deletedAt: null,
    },
    {
        id: 3,
        name: "Financeiro",
        description: "Acesso às rotinas financeiras.",
        status: "ACTIVE",
        createdAt: "2024-03-20T12:00:00.000Z",
        updatedAt: "2025-06-02T09:15:00.000Z",
        deletedAt: null,
    },
    {
        id: 4,
        name: "Operação legada",
        description: "Papel mantido apenas em vínculos antigos.",
        status: "INACTIVE",
        createdAt: "2023-09-08T12:00:00.000Z",
        updatedAt: "2025-01-12T10:00:00.000Z",
        deletedAt: null,
    },
    {
        id: 5,
        name: "Auditoria antiga",
        description: "Papel excluído e preservado para histórico.",
        status: "DELETED",
        createdAt: "2023-04-03T12:00:00.000Z",
        updatedAt: "2024-10-10T16:00:00.000Z",
        deletedAt: "2025-02-01T12:00:00.000Z",
    },
];

const seedUsers: UserListItem[] = [
    { id: 1001, name: "Ana Carolina Martins", cpf: "52998224725", email: "ana.martins@exemplo.com", phone: "11987654321", status: "ACTIVE", passwordChangeRequired: false, createdAt: "2024-01-12T13:45:00.000Z", updatedAt: "2026-06-15T16:20:00.000Z", roles: [roles[0], roles[2]] },
    { id: 1002, name: "Bruno Henrique Souza", cpf: "16899535009", email: "bruno.souza@exemplo.com", phone: "21976543210", status: "LOCKED", passwordChangeRequired: false, createdAt: "2024-02-18T10:10:00.000Z", updatedAt: "2026-07-01T12:00:00.000Z", roles: [roles[1]] },
    { id: 1003, name: "Camila Ribeiro Lima", cpf: "11144477735", email: "camila.lima@exemplo.com", phone: "31965432109", status: "DISABLED", passwordChangeRequired: false, createdAt: "2024-03-22T17:30:00.000Z", updatedAt: "2026-05-19T09:40:00.000Z", roles: [] },
    { id: 1004, name: "Daniel Oliveira Costa", cpf: "12345678909", email: "daniel.costa@exemplo.com", phone: null, status: "PENDING_FIRST_ACCESS", passwordChangeRequired: false, createdAt: "2024-04-05T11:25:00.000Z", updatedAt: null, roles: [roles[1]] },
    { id: 1005, name: "Eduarda Almeida Rocha", cpf: "98765432100", email: null, phone: "11944556677", status: "CHANGE_PASSWORD_REQUIRED", passwordChangeRequired: true, createdAt: "2024-05-14T14:00:00.000Z", updatedAt: "2026-04-22T18:12:00.000Z", roles: [roles[2]] },
    { id: 1006, name: "Felipe Santos Nogueira", cpf: "39053344705", email: "felipe.nogueira@exemplo.com", phone: "13933445566", status: "ACTIVE", passwordChangeRequired: false, createdAt: "2024-06-07T08:35:00.000Z", updatedAt: null, roles: [roles[1], roles[3]] },
    { id: 1007, name: "Gabriela Fernandes", cpf: "01234567890", email: "gabriela.fernandes@exemplo.com", phone: "21922334455", status: "ACTIVE", passwordChangeRequired: false, createdAt: "2024-07-19T15:42:00.000Z", updatedAt: "2026-03-10T10:05:00.000Z", roles: [roles[0], roles[1], roles[2]] },
    { id: 1008, name: "Henrique Moreira Alves", cpf: "34567890123", email: "henrique.alves@exemplo.com", phone: null, status: "DISABLED", passwordChangeRequired: false, createdAt: "2024-08-25T12:18:00.000Z", updatedAt: "2026-02-28T09:30:00.000Z", roles: [roles[4]] },
    { id: 1009, name: "Isabela Monteiro", cpf: "45678901234", email: "isabela.monteiro@exemplo.com", phone: "31911223344", status: "ACTIVE", passwordChangeRequired: false, createdAt: "2024-09-11T09:50:00.000Z", updatedAt: null, roles: [] },
    { id: 1010, name: "João Pedro Barros", cpf: "56789012345", email: "joao.barros@exemplo.com", phone: "11900112233", status: "LOCKED", passwordChangeRequired: false, createdAt: "2024-10-03T16:05:00.000Z", updatedAt: "2026-01-14T13:20:00.000Z", roles: [roles[1]] },
    { id: 1011, name: "Karen Cristina Melo", cpf: "67890123456", email: null, phone: "21999001122", status: "ACTIVE", passwordChangeRequired: false, createdAt: "2024-11-16T13:15:00.000Z", updatedAt: null, roles: [roles[2]] },
    { id: 1012, name: "Lucas Vieira Campos", cpf: "78901234567", email: "lucas.campos@exemplo.com", phone: "31988990011", status: "PENDING_FIRST_ACCESS", passwordChangeRequired: false, createdAt: "2024-12-09T10:45:00.000Z", updatedAt: null, roles: [] },
    { id: 1013, name: "Mariana Freitas Dias", cpf: "89012345678", email: "mariana.dias@exemplo.com", phone: "11977889900", status: "ACTIVE", passwordChangeRequired: false, createdAt: "2025-01-21T11:30:00.000Z", updatedAt: "2026-07-18T15:45:00.000Z", roles: [roles[0]] },
    { id: 1014, name: "Nicolas Araújo Pinto", cpf: "90123456789", email: "nicolas.pinto@exemplo.com", phone: null, status: "CHANGE_PASSWORD_REQUIRED", passwordChangeRequired: true, createdAt: "2025-02-13T14:55:00.000Z", updatedAt: null, roles: [roles[1]] },
    { id: 1015, name: "Olívia Cardoso Reis", cpf: "10234567890", email: "olivia.reis@exemplo.com", phone: "21966778899", status: "DISABLED", passwordChangeRequired: false, createdAt: "2025-03-08T08:20:00.000Z", updatedAt: "2026-06-30T17:10:00.000Z", roles: [roles[3]] },
    { id: 1016, name: "Paulo César Teixeira", cpf: "21345678901", email: "paulo.teixeira@exemplo.com", phone: "31955667788", status: "ACTIVE", passwordChangeRequired: false, createdAt: "2025-04-17T16:40:00.000Z", updatedAt: null, roles: [roles[2]] },
    { id: 1017, name: "Renata Gomes Batista", cpf: "32456789012", email: "renata.batista@exemplo.com", phone: "11944557788", status: "ACTIVE", passwordChangeRequired: false, createdAt: "2025-05-29T12:05:00.000Z", updatedAt: null, roles: [roles[1], roles[2]] },
    { id: 1018, name: "Samuel Lopes Moraes", cpf: "43567890123", email: "samuel.moraes@exemplo.com", phone: "21933446677", status: "LOCKED", passwordChangeRequired: false, createdAt: "2025-06-20T09:25:00.000Z", updatedAt: "2026-05-08T10:30:00.000Z", roles: [] },
];

function cloneRole(role: AdminRole): AdminRole {
    return { ...role };
}

function cloneUser(user: UserListItem): UserListItem {
    return { ...user, roles: user.roles.map(cloneRole) };
}

function createProblem(code: string, detail: string, status = 400) {
    const problem: ApiProblem = {
        title: "Não foi possível concluir a operação",
        status,
        detail,
        code,
        timestamp: "2026-08-08T12:00:00.000Z",
    };

    return { rawData: problem, status };
}

function normalize(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toLowerCase();
}

export function createMockAdminUsersDataSource(
    options: MockAdminUsersOptions = {},
): AdminUsersDataSource {
    let users = options.emptyList ? [] : seedUsers.map(cloneUser);
    const delay = options.delay ?? 450;

    async function wait() {
        await new Promise((resolve) => setTimeout(resolve, delay));
    }

    function findUser(userId: number): UserListItem {
        const user = users.find((item) => item.id === userId);
        if (!user) throw createProblem("USER_NOT_FOUND", "Usuário não encontrado.", 404);
        return user;
    }

    return {
        async listUsers(query: UserListQuery) {
            await wait();
            if (options.failList) {
                throw createProblem("INTERNAL_SERVER_ERROR", "Não foi possível carregar os usuários.", 500);
            }

            const search = normalize(query.search?.trim() ?? "");
            let filtered = users.filter((user) => {
                const matchesSearch = !search || [user.name, user.email, user.cpf, user.phone]
                    .some((value) => value && normalize(value).includes(search));
                const matchesStatus = !query.statuses?.length || query.statuses.includes(user.status);
                const matchesRole = !query.roleIds?.length || user.roles.some((role) => query.roleIds?.includes(role.id));
                return matchesSearch && matchesStatus && matchesRole;
            });

            filtered = [...filtered].sort((first, second) => first.name.localeCompare(second.name, "pt-BR"));
            const totalElements = filtered.length;
            const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / query.pageSize);
            const safePage = totalPages === 0 ? 0 : Math.min(query.page, totalPages - 1);
            const start = safePage * query.pageSize;
            const content = filtered.slice(start, start + query.pageSize).map(cloneUser);

            return {
                content,
                totalElements,
                totalPages,
                number: safePage,
                size: query.pageSize,
                first: safePage === 0,
                last: totalPages === 0 || safePage === totalPages - 1,
                numberOfElements: content.length,
                empty: content.length === 0,
                sort: { sorted: true, unsorted: false, empty: false },
            };
        },

        async getUser(userId: number) {
            await wait();
            if (options.failDetailsForId === userId) {
                throw createProblem("USER_NOT_FOUND", "Não foi possível carregar os detalhes do usuário.", 404);
            }
            return cloneUser(findUser(userId));
        },

        async listRoles() {
            await wait();
            if (options.failRoleCatalog) {
                throw createProblem("INTERNAL_SERVER_ERROR", "Não foi possível carregar o catálogo de papéis.", 500);
            }
            return roles.map(cloneRole);
        },

        async disableUser(userId: number) {
            await wait();
            if (options.failStatusForId === userId) {
                throw createProblem("ACCESS_DENIED", "Você não tem permissão para desativar este usuário.", 403);
            }
            const current = findUser(userId);
            if (current.status === "DISABLED") {
                throw createProblem("USER_ALREADY_DISABLED", "O usuário já está desativado.", 409);
            }
            const updated = { ...current, status: "DISABLED" as const, updatedAt: "2026-08-08T12:00:00.000Z" };
            users = users.map((user) => user.id === userId ? updated : user);
            return cloneUser(updated);
        },

        async enableUser(userId: number) {
            await wait();
            if (options.failStatusForId === userId) {
                throw createProblem("ACCESS_DENIED", "Você não tem permissão para reativar este usuário.", 403);
            }
            const current = findUser(userId);
            if (current.status !== "DISABLED") {
                throw createProblem("USER_NOT_DISABLED", "O usuário não está desativado.", 409);
            }
            const updated = { ...current, status: "ACTIVE" as const, updatedAt: "2026-08-08T12:00:00.000Z" };
            users = users.map((user) => user.id === userId ? updated : user);
            return cloneUser(updated);
        },

        async replaceUserRoles(userId: number, roleIds: number[]) {
            await wait();
            if (options.failRolesForId === userId) {
                throw createProblem("VALIDATION_ERROR", "Não foi possível salvar os papéis selecionados.", 422);
            }
            const current = findUser(userId);
            const uniqueRoleIds = [...new Set(roleIds)];
            const selectedRoles = uniqueRoleIds.map((roleId) => {
                const role = roles.find((item) => item.id === roleId);
                if (!role) throw createProblem("ROLE_NOT_FOUND", "Um dos papéis selecionados não foi encontrado.", 404);
                const alreadyLinked = current.roles.some((item) => item.id === roleId);
                if (!alreadyLinked && role.status !== "ACTIVE") {
                    throw createProblem(
                        role.status === "DELETED" ? "DELETED_ROLE_CANNOT_BE_CHANGED" : "INACTIVE_ROLE_CANNOT_BE_USED",
                        "Papéis inativos ou excluídos não podem ser atribuídos.",
                        409,
                    );
                }
                return role;
            });

            const updated = { ...current, roles: selectedRoles.map(cloneRole), updatedAt: "2026-08-08T12:00:00.000Z" };
            users = users.map((user) => user.id === userId ? updated : user);
            return selectedRoles.map(cloneRole);
        },
    };
}
