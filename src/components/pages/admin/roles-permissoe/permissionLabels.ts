
const MODULE_LABELS: Record<string, string> = {
    AUTHENTICATION: "Autenticação",
    AUTHORIZATION: "Autorização",
    HEALTH: "Saúde",
    MEMBERSHIP: "Associação",
};

export function getModuleLabel(module: string): string {
    return MODULE_LABELS[module] ?? module;
}

const PERMISSION_NAME_LABELS: Record<string, string> = {
    AUTHENTICATION_USER_READ: "Consultar usuários",
    AUTHENTICATION_USER_CREATE: "Criar usuários",
    AUTHENTICATION_USER_UPDATE: "Atualizar usuários",
    AUTHENTICATION_USER_DISABLE: "Desativar usuários",
    AUTHENTICATION_USER_ENABLE: "Reativar usuários",
    AUTHENTICATION_USER_PASSWORD_RESET_LINK_GENERATE: "Gerar link de redefinição de senha",
    AUTHENTICATION_USER_TEMPORARY_PASSWORD_GENERATE: "Gerar senha provisória",

    AUTHORIZATION_ROLE_READ: "Consultar cargos",
    AUTHORIZATION_ROLE_CREATE: "Criar cargos",
    AUTHORIZATION_ROLE_UPDATE: "Atualizar cargos",
    AUTHORIZATION_ROLE_DELETE: "Excluir cargos",
    AUTHORIZATION_ROLE_DISABLE: "Desativar cargos",
    AUTHORIZATION_ROLE_ENABLE: "Reativar cargos",
    AUTHORIZATION_PERMISSION_READ: "Consultar permissões",
    AUTHORIZATION_PERMISSION_ASSIGN: "Atribuir permissões",
    AUTHORIZATION_PERMISSION_REVOKE: "Revogar permissões",
    AUTHORIZATION_USER_ROLE_READ: "Consultar cargos dos usuários",
    AUTHORIZATION_USER_ROLE_ASSIGN: "Vincular cargos a usuários",
    AUTHORIZATION_USER_ROLE_REVOKE: "Remover cargos de usuários",

    HEALTH_MEDICAL_PROFILE_READ: "Consultar perfil médico",
    HEALTH_MEDICAL_PROFILE_UPDATE: "Atualizar perfil médico",

    MEMBERSHIP_MEMBERSHIP_REQUEST_READ: "Consultar solicitações de adesão",
    MEMBERSHIP_MEMBERSHIP_REQUEST_APPROVE: "Aprovar solicitações de adesão",
    MEMBERSHIP_MEMBERSHIP_REQUEST_REJECT: "Rejeitar solicitações de adesão",
    MEMBERSHIP_MEMBERSHIP_REQUEST_INVITE_RESEND: "Reenviar convite de adesão",
};

export function getPermissionName(permission: PermissionResponse): string {
    return PERMISSION_NAME_LABELS[permission.code] ?? permission.description;
}
