export const routePermissions: Record<string, {module: string[]; actions: string[]}> = {
    "/register": { module: ["AUTHENTICATION"], actions: ['USER_CREATE'] },
};