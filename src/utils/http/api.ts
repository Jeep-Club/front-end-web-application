export enum HttpAPIRoutes {
    LOGIN = "authentication/login",
    REGISTER = "authentication/register",
    REFRESH = "authentication/refresh",
    LOGOUT = "authentication/logout",
    ME = "authentication/me",
    PERMISSIONS = "authorization/permissions",
    ADMIN_DEPENDENTS = "socios/{id}/dependents",
    ADMIN_MEDICAL_PROFILES = "admin/medical-profiles",
    PASSWORD_RECOVERY_REQUEST = "authentication/password-recovery/requests",
    PASSWORD_RECOVERY_EMAIL_TOKEN = "authentication/password-recovery/requests/email-token"

}

// export enum HttpAPIRoutes {
//     LOGIN = "api/mock/login",
//     REGISTER = "api/mock/register",
//     REFRESH = "api/mock/refresh",
//     LOGOUT = "api/mock/logout",
//     ME = "api/mock/me",
//     PERMISSIONS = "api/mock/permissions"
// }

export enum HttpPublicAPIRoutes {
    
}