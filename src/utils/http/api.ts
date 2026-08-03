export enum HttpAPIRoutes {
    // Temporários enquanto usamos autenticação mock
    LOGIN = "api/mock/login",
    REFRESH = "api/mock/refresh",
    ME = "api/mock/me",

    // Continuam apontando para o backend real
    REGISTER = "authentication/register",
    LOGOUT = "authentication/logout",
    PERMISSIONS = "authorization/permissions",

    ADMIN_DEPENDENTS = "socios/{id}/dependents",
    ADMIN_MEDICAL_PROFILES = "admin/medical-profiles",

    PASSWORD_RECOVERY_REQUEST =
        "authentication/password-recovery/requests",

    PASSWORD_RECOVERY_EMAIL_TOKEN =
        "authentication/password-recovery/requests/email-token",

    VEHICLES_INCLUDE_MEMBER = "vehicles/include/member",
    VEHICLES_LIST_MEMBER = "vehicles/list/member",
}

export enum HttpPublicAPIRoutes {}