export function mapPermissionToModule(permission: Permission[]): PermissionModule[] {
    const permissionsByModule: Record<string, string[]> = {};

    permission.forEach((perm) => {
        if (!permissionsByModule[perm.module]) {
            permissionsByModule[perm.module] = [];
        }
        const action = perm.code.split('_').slice(1).join('_'); // Remove o prefixo do módulo

        permissionsByModule[perm.module].push(action);
    });

    return Object.entries(permissionsByModule).map(([module, actions]) => ({
        module,
        actions,
    }));
}

export const mapMePermissionToModule = (permission: string[]): PermissionModule[] => {
    const permissionsByModule: Record<string, string[]> = {};

    permission.forEach((perm) => {
        const [module, ...action] = perm.split('_');

        if (!permissionsByModule[module]) {
            permissionsByModule[module] = [];
        }

        permissionsByModule[module].push(action.join('_'));
    });

    return Object.entries(permissionsByModule).map(([module, actions]) => ({
        module,
        actions,
    }));
}