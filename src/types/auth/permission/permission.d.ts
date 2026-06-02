type GetPermissionResponse = Permission[];

interface Permission {
    id: number;
    code: string;
    description: string;
    module: string;
}

interface PermissionModule {
    actions: string[];
    module: string;
}