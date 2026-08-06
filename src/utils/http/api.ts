export enum HttpAPIRoutes {
    LOGIN = "authentication/login",
    REFRESH = "authentication/refresh",
    ME = "authentication/me",
    ADMIN_USERS = "authentication/admin/users",
    REGISTER = "authentication/register",
    LOGOUT = "authentication/logout",
    PERMISSIONS = "authorization/permissions",
    AUTHORIZATION_ROLES = "authorization/roles",

    ADMIN_DEPENDENTS = "socios/{id}/dependents",
    ADMIN_MEDICAL_PROFILES = "admin/medical-profiles",
    PASSWORD_RECOVERY_REQUEST = "authentication/password-recovery/requests",
    PASSWORD_RECOVERY_EMAIL_TOKEN = "authentication/password-recovery/requests/email-token",
    VEHICLES_INCLUDE_MEMBER = "vehicles/include/member",
    VEHICLES_LIST_MEMBER = "vehicles/list/member",
    VEHICLES_EDIT_MEMBER = "vehicles/edit/member",
    VEHICLES_DETAIL_FOR_EDIT_MEMBER = "vehicles/detail-for-edit/member",
    VEHICLES_DELETE_MEMBER = "vehicles/delete/member",
    VEHICLES_DETAIL_MEMBER = "vehicles/detail/member"
}

export enum HttpPublicAPIRoutes {}
