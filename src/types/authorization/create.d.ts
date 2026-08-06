// Espelha o CreateRoleRequestDTO do backend (POST /authorization/roles).
interface CreateRoleRequest {
    name: string;
    description?: string;
}
