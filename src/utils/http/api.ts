export enum HttpAPIRoutes {
    LOGIN = "authentication/login",
    REFRESH = "authentication/refresh",
    AUTHENTICATION_ME = "authentication/me",
    IDENTITY_ME = "identity/me",
    AUTHORIZATION_ME = "authorization/me",
    ADMIN_USERS = "identity/admin/users",
    REGISTER = "identity/register",
    LOGOUT = "authentication/logout",
    PERMISSIONS = "authorization/permissions",
    AUTHORIZATION_ROLES = "authorization/roles",

    USER_ROLES = "authorization/users/{id}/roles",
    TOOLS = "tools",

    ADMIN_DEPENDENTS = "socios/{id}/dependents",
    ADMIN_MEDICAL_PROFILES = "admin/medical-profiles",
    MEDICAL_PROFILE_MEMBER = "medical-profiles/me",
    DEPENDENTS_MEMBER = "dependents",
    PASSWORD_RECOVERY_REQUEST = "authentication/password-recovery/requests",
    PASSWORD_RECOVERY_EMAIL_TOKEN = "authentication/password-recovery/requests/email-token",
    VEHICLES_INCLUDE_MEMBER = "vehicles/include/member",
    VEHICLES_LIST_MEMBER = "vehicles/list/member",
    VEHICLES_EDIT_MEMBER = "vehicles/edit/member",
    VEHICLES_DETAIL_FOR_EDIT_MEMBER = "vehicles/detail-for-edit/member",
    VEHICLES_DELETE_MEMBER = "vehicles/delete/member",
    VEHICLES_DETAIL_MEMBER = "vehicles/detail/member",

    BILLING_CHARGE_DEFINITIONS = "billing/charge-definitions",
    BILLING_CHARGE_ASSIGNMENTS = "billing/charge-assignments",
    BILLING_MY_MEMBER_CHARGES = "billing/me/member-charges",
}

export enum HttpPublicAPIRoutes {}
