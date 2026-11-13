import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { UserManagementView } from "./UserManagementView";

const user: AdminUser = {
    id: 42,
    name: "Marina da Silva",
    birthDate: "1990-05-10",
    cpf: "12345678909",
    email: "marina@example.test",
    membershipNumber: "27",
    rg: "123456789",
    phoneNumber: "12999999999",
    status: "ACTIVE",
    createdAt: "2025-01-10T12:00:00Z",
    disabledAt: null,
    updatedAt: null,
};

const permissions: UserManagementPermissions = {
    canReadUsers: true,
    canCreateUsers: true,
    canUpdateUsers: true,
    canDisableUsers: true,
    canEnableUsers: true,
    canArchiveUsers: true,
    canUnarchiveUsers: true,
    canDeleteUsers: true,
    canExportUsers: true,
    canReadUserHistory: true,
    canReadRoleCatalog: true,
    canReadUserRoles: true,
    canAssignRoles: true,
    canRevokeRoles: true,
    canManageMembershipRegistration: true,
};

const meta = {
    title: "Páginas/Gestão administrativa/Usuários/Lista",
    component: UserManagementView,
    parameters: { layout: "fullscreen" },
    args: {
        users: [user],
        query: {},
        permissions,
        totalItems: 1,
        totalPages: 1,
        pageIndex: 0,
        pageSize: 10,
        isLoading: false,
        isFetching: false,
        onSearchChange: fn(),
        onStatusChange: fn(),
        onClearFilters: fn(),
        onPaginationChange: fn(),
        onSortChange: fn(),
        onViewUser: fn(),
        onCreateUser: fn(),
        onChangeUserStatus: fn(),
        onManageMembershipNumber: fn(),
        onExportUsers: fn(),
        searchType: "q",
        setSearchType: fn(),
    },
    argTypes: {
        users: { control: false },
        query: { control: false },
        permissions: { control: false },
        onSearchChange: { control: false },
        onStatusChange: { control: false },
        onClearFilters: { control: false },
        onPaginationChange: { control: false },
        onSortChange: { control: false },
        onViewUser: { control: false },
        onCreateUser: { control: false },
        onChangeUserStatus: { control: false },
        onManageMembershipNumber: { control: false },
        onExportUsers: { control: false },
        setSearchType: { control: false },
    },
} satisfies Meta<typeof UserManagementView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComPermissaoParaGerenciarMatricula: Story = {};

export const SemPermissaoParaGerenciarMatricula: Story = {
    args: {
        permissions: { ...permissions, canManageMembershipRegistration: false },
    },
};
