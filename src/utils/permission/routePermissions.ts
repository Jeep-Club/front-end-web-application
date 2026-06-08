export const routePermissions: Record<string, PermissionModule[]> = {
    "/register": [{ module: "AUTHENTICATION", actions: ['USER_CREATE'] }],
    "/home": []
};