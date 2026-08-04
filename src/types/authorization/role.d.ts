interface CreateRoleRequest {
    name: string;
    description?: string;
}

type RoleStatus = "ACTIVE" | "INACTIVE" | "DELETED";

interface RoleResponse {
    id: number;
    name: string;
    description: string | null;
    status: RoleStatus;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
}
