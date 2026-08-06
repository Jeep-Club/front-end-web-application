type RoleStatus = "ACTIVE" | "INACTIVE" | "DELETED";

// Espelha o RoleResponseDTO do backend — mesmo shape retornado por
// criar, listar, buscar por id, editar, ativar/desativar.
interface RoleResponse {
    id: number;
    name: string;
    description: string | null;
    status: RoleStatus;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
}
