// Espelha o UpdateRoleRequestDTO do backend (PUT /authorization/roles/{roleId}).
interface UpdateRoleRequest {
    name: string;
    description?: string;
}
