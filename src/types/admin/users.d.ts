type UserStatus =
    | "ACTIVE"
    | "LOCKED"
    | "DISABLED"
    | "PENDING_FIRST_ACCESS"
    | "CHANGE_PASSWORD_REQUIRED";

interface AdminUser {
    id: number;
    name: string;
    cpf: string;
    email: string | null;
    phone: string | null;
    accountStatus: UserStatus;
    authenticationStatus: string;
    passwordChangeRequired: boolean;
    credentialStatus: string;
    createdAt: string;
    updatedAt: string | null;
}

type RoleStatus = "ACTIVE" | "INACTIVE" | "DELETED";

interface AdminRole {
    id: number;
    name: string;
    description: string | null;
    status: RoleStatus;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
}

interface UserListItem extends AdminUser {
    roles: AdminRole[];
}

interface UserListQuery {
    search?: string;
    statuses?: UserStatus[];
    roleIds?: number[];
    page: number;
    pageSize: number;
    sort?: string;
}
interface UserManagementPermissions {
    canReadUsers: boolean;
    canDisableUsers: boolean;
    canEnableUsers: boolean;
    canReadRoleCatalog: boolean;
    canReadUserRoles: boolean;
    canAssignRoles: boolean;
    canRevokeRoles: boolean;
}

interface AdminUsersDataSource {
    listUsers(query: UserListQuery): Promise<PageResponse<UserListItem>>;
    getUser(userId: number): Promise<UserListItem>;
    listRoles(): Promise<AdminRole[]>;
    disableUser(userId: number): Promise<UserListItem>;
    enableUser(userId: number): Promise<UserListItem>;
    replaceUserRoles(userId: number, roleIds: number[]): Promise<AdminRole[]>;
}

interface AdminUserSearchParams {
    id?: string;
    name?: string;
    cpf?: string;
    email?: string;
    phoneNumber?: string;

    accountStatus?: "ACTIVE" | "DISABLED";
    authenticationStatus?: "ENABLED" | "LOCKED";
    credentialStatus?:
        | "PERMANENT"
        | "PENDING_FIRST_ACCESS"
        | "CHANGE_REQUIRED";

    passwordChangeRequired?: string;

    createdFrom?: string;
    createdTo?: string;
    updatedFrom?: string;
    updatedTo?: string;

    q?: string;

    fields?: string;
    page?: string;
    size?: string;
    sort?: string;
}

