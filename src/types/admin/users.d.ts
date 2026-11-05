type UserStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

type AdminUserLifecycleAction = "enable" | "disable" | "archive" | "unarchive";

interface AdminUser {
    id: number;
    name: string;
    birthDate: string | null;
    cpf: string;
    email: string | null;
    membershipNumber?: string | null;
    rg: string | null;
    phoneNumber: string | null;
    profilePhotoStorageKey?: string | null;
    profilePhotoUrl?: string | null;
    status: UserStatus;
    createdAt: string;
    disabledAt?: string | null;
    updatedAt?: string | null;
}

interface AdminUpdateUserRequest {
    name?: string;
    birthDate?: string | null;
    email?: string | null;
    cpf?: string;
    rg?: string | null;
    phoneNumber?: string | null;
    profilePhotoStorageKey?: string | null;
}

interface AdminUserWorkProfile {
    occupation: string | null;
    workplace: string | null;
}

interface AdminUserResidentialAddress {
    postalCode: string | null;
    street: string | null;
    number: string | null;
    complement: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
}

interface AdminUserComplementaryProfile {
    workProfile: AdminUserWorkProfile | null;
    address: AdminUserResidentialAddress | null;
    profileCompletionPending: boolean;
    membershipNumber?: string | null;
}

interface AdminUserDeletionHistory {
    originalId: number;
    previousStatus: UserStatus;
    createdAt: string;
    disabledAt: string | null;
    archivedAt: string | null;
    updatedAt: string | null;
    deletedByUserId: number | null;
    deletedAt: string;
    reason: string | null;
    schemaVersion: number;
}

type RoleStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

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
    canCreateUsers: boolean;
    canUpdateUsers: boolean;
    canDisableUsers: boolean;
    canEnableUsers: boolean;
    canArchiveUsers: boolean;
    canUnarchiveUsers: boolean;
    canDeleteUsers: boolean;
    canExportUsers: boolean;
    canReadUserHistory: boolean;
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
    tab?: "applications";
    id?: string;
    name?: string;
    birthDate?: string;
    cpf?: string;
    rg?: string;
    email?: string;
    phoneNumber?: string;
    membershipNumber?: string;

    status?: UserStatus | "ALL";

    createdFrom?: string;
    createdTo?: string;
    updatedFrom?: string;
    updatedTo?: string;

    q?: string;

    page?: string;
    size?: string;
    sort?: string;
}
