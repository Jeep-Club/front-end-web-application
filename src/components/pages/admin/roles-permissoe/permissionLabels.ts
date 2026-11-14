const MODULE_LABELS: Record<string, string> = {
    AUTHENTICATION: "Autenticação",
    AUTHORIZATION: "Autorização",
    IDENTITY: "Usuários",
    HEALTH: "Saúde",
    MEMBERSHIP: "Membritude",
    BILLING: "Cobranças",
    DEPENDENTS: "Dependentes",
    PUBLICATIONS: "Publicações",
    TOOLS: "Ferramentas",
    VEHICLES: "Veículos",
};

export function getModuleLabel(module: string): string {
    return MODULE_LABELS[module] ?? "Outros";
}

const PERMISSION_NAME_LABELS: Record<string, string> = {
    IDENTITY_USER_ARCHIVE: "Arquivar usuários",
    IDENTITY_USER_UNARCHIVE: "Desarquivar usuários como inativos",
    IDENTITY_USER_DELETE: "Excluir usuários sem dependências impeditivas",
    IDENTITY_USER_HISTORY_READ: "Consultar histórico de usuários",
    AUTHORIZATION_ROLE_ARCHIVE: "Arquivar cargos",
    AUTHORIZATION_ROLE_UNARCHIVE: "Desarquivar cargos como inativos",
    AUTHORIZATION_ROLE_HISTORY_READ: "Consultar histórico de cargos",
    VEHICLES_VEHICLE_ACTIVATE: "Ativar veículos",
    VEHICLES_VEHICLE_DEACTIVATE: "Inativar veículos",
    VEHICLES_VEHICLE_ARCHIVE: "Arquivar veículos",
    VEHICLES_VEHICLE_UNARCHIVE: "Desarquivar veículos como inativos",
    BILLING_CHARGE_DEFINITION_DELETE: "Excluir definições de cobrança sem dependências impeditivas",
    BILLING_CHARGE_DEFINITION_HISTORY_READ: "Consultar histórico de definições de cobrança",
    MEMBERSHIP_MEMBER_AUDIT_READ: "Consultar auditoria de matrículas",
    MEMBERSHIP_MEMBER_NUMBER_RESERVE: "Reservar números de matrícula permanentemente",
    MEMBERSHIP_MEMBER_NUMBER_ISSUE: "Emitir matrículas administrativamente",
    MEMBERSHIP_MEMBER_IMPORT: "Simular e aplicar conciliação histórica autorizada",
    IDENTITY_USER_EXPORT: "Exportar usuários",
    AUTHENTICATION_EXPORT: "Exportar autenticação",
    AUTHORIZATION_EXPORT: "Exportar cargos e permissões",
    MEMBERSHIP_EXPORT: "Exportar associados",
    VEHICLES_VEHICLE_EXPORT: "Exportar veículos",
    HEALTH_MEDICAL_PROFILE_EXPORT: "Exportar perfis médicos",
    BILLING_EXPORT: "Exportar cobranças",
    PUBLICATIONS_EXPORT: "Exportar publicações",
    BILLING_CHARGE_ASSIGNMENT_READ: "Consultar atribuições de cobrança",
    BILLING_CHARGE_ASSIGNMENT_UPDATE: "Atualizar atribuições de cobrança",
    BILLING_CHARGE_CYCLE_GENERATE: "Gerar ciclos de cobrança",
    BILLING_CHARGE_CYCLE_READ: "Consultar ciclos de cobrança",
    BILLING_CHARGE_CYCLE_CANCEL: "Cancelar ciclos de cobrança",
    BILLING_CHARGE_CYCLE_FINISH: "Finalizar ciclos de cobrança",
    BILLING_CHARGE_CYCLE_ARCHIVE: "Arquivar ciclos de cobrança",
    BILLING_CHARGE_DEFINITION_CREATE: "Criar definições de cobrança",
    BILLING_CHARGE_DEFINITION_READ: "Consultar definições de cobrança",
    BILLING_CHARGE_DEFINITION_UPDATE: "Atualizar definições de cobrança",
    BILLING_MEMBER_CHARGE_READ: "Consultar cobranças de membros",
    BILLING_MEMBER_CHARGE_UPDATE: "Atualizar cobranças de membros",
    BILLING_MEMBER_CHARGE_CANCEL: "Cancelar cobranças de membros",
    BILLING_REFUND_READ: "Consultar reembolsos",
    BILLING_REFUND_APPROVE: "Aprovar reembolsos",
    BILLING_REFUND_REJECT: "Rejeitar reembolsos",
    BILLING_REFUND_MARK_AS_REFUNDED: "Marcar reembolsos como realizados",
    BILLING_REFUND_EXPIRE: "Expirar reembolsos",
    BILLING_REFUND_CANCEL: "Cancelar reembolsos",
    HEALTH_MEDICAL_PROFILE_DELETE: "Excluir o perfil médico",
    MEMBERSHIP_MEMBERSHIP_APPLICANT_UNBLOCK: "Desbloquear solicitantes",
    VEHICLES_VEHICLE_CREATE: "Cadastrar veículos",
    VEHICLES_VEHICLE_READ: "Consultar veículos",
    VEHICLES_VEHICLE_UPDATE: "Atualizar veículos",
    VEHICLES_VEHICLE_DELETE: "Remover veículos",
    PUBLICATIONS_SERVICE_REQUEST_CREATE: "Solicitar publicação de serviço",
    PUBLICATIONS_SERVICE_REQUEST_READ: "Consultar solicitações próprias de serviço",
    PUBLICATIONS_SERVICE_REQUEST_ADMIN_READ: "Consultar solicitações de serviço administrativamente",
    PUBLICATIONS_SERVICE_REQUEST_APPROVE: "Aprovar solicitação inicial de serviço",
    PUBLICATIONS_SERVICE_CHANGE_REQUEST_CREATE: "Solicitar alteração de serviço próprio",
    PUBLICATIONS_SERVICE_CHANGE_REQUEST_READ: "Consultar alteração própria de serviço",
    PUBLICATIONS_SERVICE_CHANGE_REQUEST_ADMIN_READ: "Consultar alterações de serviço administrativamente",
    PUBLICATIONS_SERVICE_CHANGE_REQUEST_APPROVE: "Aprovar alteração de serviço",
    PUBLICATIONS_SERVICE_CHANGE_REQUEST_REJECT: "Rejeitar alteração de serviço",
    PUBLICATIONS_SERVICE_READ: "Consultar serviço publicado",
    PUBLICATIONS_SERVICE_DELETE: "Excluir serviço próprio",
    PUBLICATIONS_SERVICE_ADMIN_READ: "Consultar serviços administrativamente",
    PUBLICATIONS_SERVICE_ADMIN_DELETE: "Excluir qualquer serviço com histórico",
    BILLING_PAYMENT_READ: "Consultar pagamentos e comprovantes",
    BILLING_PAYMENT_CONFIRM: "Confirmar pagamentos",
    BILLING_PAYMENT_REJECT: "Rejeitar pagamentos",

    IDENTITY_USER_READ: "Consultar usuários",
    IDENTITY_USER_CREATE: "Criar usuários",
    IDENTITY_USER_UPDATE: "Atualizar usuários",
    IDENTITY_USER_DISABLE: "Desativar usuários",
    IDENTITY_USER_ENABLE: "Reativar usuários",

    AUTHENTICATION_USER_PASSWORD_RESET_LINK_GENERATE:
        "Gerar link de redefinição de senha",
    AUTHENTICATION_USER_TEMPORARY_PASSWORD_GENERATE:
        "Gerar senha provisória",
    AUTHENTICATION_SESSION_READ: "Consultar sessões",
    AUTHENTICATION_SESSION_LOGOUT: "Encerrar sessões de usuários",
    AUTHENTICATION_REFRESH_TOKEN_READ: "Consultar tokens de renovação",
    AUTHENTICATION_REFRESH_TOKEN_REVOKE: "Revogar tokens de renovação",
    AUTHENTICATION_PASSWORD_RECOVERY_READ:
        "Consultar pedidos de recuperação de senha",
    AUTHENTICATION_PASSWORD_RECOVERY_CANCEL:
        "Cancelar pedidos de recuperação de senha",

    AUTHORIZATION_ROLE_READ: "Consultar cargos",
    BILLING_CHARGE_ASSIGNMENT_CREATE: "Criar atribuições de cobrança",
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
    MEMBERSHIP_MEMBERSHIP_APPLICANT_BLOCK: "Bloquear CPF de solicitante",
    MEMBERSHIP_MEMBER_READ: "Consultar matrículas",
    MEMBERSHIP_MEMBER_REGISTRATION_MANAGE: "Atribuir e retificar matrículas",
    MEMBERSHIP_BILLING_CONFIGURATION_READ: "Consultar cobrança de referência da associação",
    MEMBERSHIP_BILLING_CONFIGURATION_UPDATE: "Configurar cobrança de referência da associação",

    PUBLICATIONS_INTERACTION_LIKE: "Curtir publicações",
    PUBLICATIONS_COMMENT_CREATE: "Comentar em publicações",
    PUBLICATIONS_COMMENT_READ: "Consultar comentários",
    PUBLICATIONS_FEED_READ: "Consultar mural de publicações",
    PUBLICATIONS_PUBLICATION_READ: "Consultar publicação",

    PUBLICATIONS_EVENT_CREATE: "Criar eventos",
    PUBLICATIONS_EVENT_READ: "Consultar eventos",
    PUBLICATIONS_EVENT_READ_ADMIN: "Consultar eventos em qualquer estado",
    PUBLICATIONS_EVENT_UPDATE: "Atualizar eventos",
    PUBLICATIONS_EVENT_PUBLISH: "Publicar eventos",
    PUBLICATIONS_EVENT_CANCEL: "Cancelar eventos",
    PUBLICATIONS_EVENT_FINISH: "Finalizar eventos",
    PUBLICATIONS_EVENT_DELETE: "Excluir eventos",
    PUBLICATIONS_EVENT_REGISTER: "Inscrever-se em eventos",
    PUBLICATIONS_EVENT_REGISTRATION_READ: "Consultar inscrições em eventos",
    PUBLICATIONS_EVENT_REGISTRATION_CANCEL: "Cancelar inscrições em eventos",

    PUBLICATIONS_EVENT_GUEST_REQUEST_CREATE:
        "Solicitar participação de convidado",
    PUBLICATIONS_EVENT_GUEST_REQUEST_READ:
        "Consultar solicitações de convidados",
    PUBLICATIONS_EVENT_GUEST_REQUEST_CANCEL:
        "Cancelar solicitação própria de convidado",
    PUBLICATIONS_EVENT_GUEST_ALLOCATE:
        "Alocar ou realocar convidado em transporte",
    PUBLICATIONS_EVENT_GUEST_UNASSIGN: "Remover convidado do transporte",
    PUBLICATIONS_EVENT_GUEST_CANCEL: "Cancelar participação de convidado",
    PUBLICATIONS_EVENT_GUEST_REACTIVATE:
        "Reativar convidado na lista de espera",
    PUBLICATIONS_EVENT_GUEST_HISTORY_READ:
        "Consultar histórico de alterações do convidado",
    PUBLICATIONS_EVENT_GUEST_ADMIN_CREATE:
        "Cadastrar convidado",
    PUBLICATIONS_EVENT_GUEST_ADMIN_READ:
        "Consultar convidados",
    PUBLICATIONS_EVENT_GUEST_APPROVE: "Aprovar solicitação de convidado",
    PUBLICATIONS_EVENT_GUEST_REJECT: "Rejeitar solicitação de convidado",

    PUBLICATIONS_EVENT_RIDE_OFFER_READ: "Consultar ofertas de carona",
    PUBLICATIONS_EVENT_RIDE_OFFER_RESPOND: "Responder a ofertas de carona",
    PUBLICATIONS_EVENT_RIDE_OFFER_SELECT: "Selecionar oferta de carona",

    PUBLICATIONS_EVENT_ADMIN_DASHBOARD_READ:
        "Consultar painel de eventos",
    PUBLICATIONS_EVENT_HEALTH_EMERGENCY_READ:
        "Consultar dados médicos de emergência em eventos",

    TOOLS_TOOL_READ: "Consultar ferramentas",
    TOOLS_TOOL_CREATE: "Cadastrar ferramentas",
    TOOLS_TOOL_UPDATE: "Atualizar ferramentas",
    TOOLS_TOOL_DELETE: "Excluir ferramentas",
    TOOLS_TOOL_ACTIVATE: "Ativar ferramentas",
    TOOLS_TOOL_DEACTIVATE: "Desativar ferramentas",
    TOOLS_TOOL_ARCHIVE: "Arquivar ferramentas",
    TOOLS_TOOL_UNARCHIVE: "Desarquivar ferramentas",
    TOOLS_TOOL_EXPORT: "Exportar ferramentas",

    DEPENDENTS_DEPENDENT_READ: "Consultar dependentes",
    DEPENDENTS_DEPENDENT_ACTIVATE: "Ativar dependentes",
    DEPENDENTS_DEPENDENT_DEACTIVATE: "Desativar dependentes",
    DEPENDENTS_DEPENDENT_ARCHIVE: "Arquivar dependentes",
    DEPENDENTS_DEPENDENT_UNARCHIVE: "Desarquivar dependentes",
    DEPENDENTS_DEPENDENT_DELETE: "Excluir dependentes",
    DEPENDENTS_DEPENDENT_PHOTO_UPDATE: "Atualizar foto de dependentes",
    DEPENDENTS_DEPENDENT_EXPORT: "Exportar dependentes",

    PUBLICATIONS_SERVICE_REQUEST_REJECT:
        "Rejeitar solicitação inicial de serviço",
    PUBLICATIONS_NOTICE_CREATE: "Criar avisos",
    PUBLICATIONS_NOTICE_READ: "Consultar avisos",
    PUBLICATIONS_NOTICE_UPDATE: "Editar avisos",
    PUBLICATIONS_NOTICE_PUBLISH: "Publicar avisos",
    PUBLICATIONS_NOTICE_ARCHIVE: "Arquivar avisos",
    PUBLICATIONS_NOTICE_DELETE: "Excluir avisos com histórico",
};

const PERMISSION_ACTION_LABELS: Record<string, string> = {
    READ: "Consultar",
    CREATE: "Cadastrar",
    UPDATE: "Editar",
    DELETE: "Excluir",
    ENABLE: "Ativar",
    DISABLE: "Desativar",
    ACTIVATE: "Ativar",
    DEACTIVATE: "Desativar",
    ARCHIVE: "Arquivar",
    UNARCHIVE: "Desarquivar",
    EXPORT: "Exportar",
    ASSIGN: "Atribuir",
    REVOKE: "Revogar",
    APPROVE: "Aprovar",
    REJECT: "Rejeitar",
    CANCEL: "Cancelar",
    PUBLISH: "Publicar",
    FINISH: "Finalizar",
    REGISTER: "Inscrever",
    RESPOND: "Responder",
    SELECT: "Selecionar",
    ALLOCATE: "Alocar",
    UNASSIGN: "Remover",
};

const PERMISSION_RESOURCE_LABELS: Record<string, string> = {
    DEPENDENT: "dependentes",
    DEPENDENTS: "dependentes",
    MEMBER_DEPENDENT: "dependentes",
    USER: "usuários",
    MEMBER: "associados",
    VEHICLE: "veículos",
    TOOL: "ferramentas",
    PAYMENT: "pagamentos",
    CHARGE: "cobranças",
    CHARGE_DEFINITION: "definições de cobrança",
    CHARGE_ASSIGNMENT: "atribuições de cobrança",
    MEMBERSHIP_REQUEST: "solicitações de adesão",
    MEMBERSHIP_APPLICATION: "solicitações de associação",
    APPLICANT: "solicitantes",
    ROLE: "cargos",
    PERMISSION: "permissões",
    EVENT: "eventos",
    EVENT_REGISTRATION: "inscrições em eventos",
    EVENT_GUEST: "convidados de eventos",
    GUEST: "convidados",
    NOTICE: "avisos",
    COMMENT: "comentários",
    PUBLICATION: "publicações",
    FEED: "mural de publicações",
    MEDICAL_PROFILE: "perfil médico",
    SESSION: "sessões",
    PASSWORD_RECOVERY: "recuperação de senha",
    PROFILE: "perfis",
    DOCUMENT: "documentos",
};

const ENGLISH_DESCRIPTION_LABELS: Record<string, string> = {
    "Publication: like and unlike":
        "Curtir e remover curtida de publicações.",
    "Publication: create comment":
        "Criar comentários em publicações.",
    "Publication: read comments":
        "Consultar comentários de publicações.",
    "Publication: read feed":
        "Consultar o mural de publicações.",
    "Publication: read detail":
        "Consultar os detalhes de uma publicação.",

    "Event: create": "Criar eventos.",
    "Event: read": "Consultar eventos.",
    "Event: read admin":
        "Consultar eventos na área administrativa.",
    "Event: update": "Atualizar eventos.",
    "Event: publish": "Publicar eventos.",
    "Event: cancel": "Cancelar eventos.",
    "Event: finish": "Finalizar eventos.",
    "Event: delete": "Excluir eventos.",
    "Event: register":
        "Inscrever participantes em eventos.",
    "Event: registration read":
        "Consultar inscrições em eventos.",
    "Event: registration cancel":
        "Cancelar inscrições em eventos.",

    "Event: guest request create":
        "Solicitar a participação de convidados.",
    "Event: guest request read":
        "Consultar solicitações de convidados.",
    "Event: cancel own personal guest":
        "Cancelar a própria solicitação de convidado.",
    "Event: directly allocate or relocate administrative guest":
        "Alocar ou realocar convidados em transportes.",
    "Event: unassign administrative guest transport":
        "Remover convidados de transportes.",
    "Event: cancel guest participation":
        "Cancelar a participação de convidados.",
    "Event: reactivate administrative guest to standby":
        "Reativar convidados na lista de espera.",
    "Event: read retained guest transition history":
        "Consultar o histórico de alterações dos convidados.",
    "Event: guest admin create":
        "Cadastrar convidados pela área administrativa.",
    "Event: guest admin read":
        "Consultar convidados pela área administrativa.",
    "Event: guest approve":
        "Aprovar solicitações de convidados.",
    "Event: guest reject":
        "Rejeitar solicitações de convidados.",

    "Event: ride offer read":
        "Consultar ofertas de carona.",
    "Event: ride offer respond":
        "Responder a ofertas de carona.",
    "Event: ride offer select":
        "Selecionar ofertas de carona.",
    "Event: admin dashboard read":
        "Consultar o painel administrativo de eventos.",
    "Event: health emergency read":
        "Consultar dados médicos de emergência em eventos.",
};

const MEMBER_PERMISSION_CODES = new Set([
    "PUBLICATIONS_INTERACTION_LIKE",
    "PUBLICATIONS_COMMENT_CREATE",
    "PUBLICATIONS_COMMENT_READ",
    "PUBLICATIONS_FEED_READ",
    "PUBLICATIONS_PUBLICATION_READ",
    "PUBLICATIONS_EVENT_READ",
    "PUBLICATIONS_EVENT_REGISTER",
    "PUBLICATIONS_EVENT_REGISTRATION_CANCEL",
    "PUBLICATIONS_EVENT_GUEST_REQUEST_CREATE",
    "PUBLICATIONS_EVENT_GUEST_REQUEST_READ",
    "PUBLICATIONS_EVENT_GUEST_REQUEST_CANCEL",
    "PUBLICATIONS_EVENT_RIDE_OFFER_READ",
    "PUBLICATIONS_EVENT_RIDE_OFFER_RESPOND",
    "PUBLICATIONS_EVENT_RIDE_OFFER_SELECT",
    "PUBLICATIONS_SERVICE_REQUEST_CREATE",
    "PUBLICATIONS_SERVICE_REQUEST_READ",
    "PUBLICATIONS_SERVICE_CHANGE_REQUEST_CREATE",
    "PUBLICATIONS_SERVICE_CHANGE_REQUEST_READ",
    "PUBLICATIONS_SERVICE_READ",
    "PUBLICATIONS_SERVICE_DELETE",
]);

export function isMemberPermission(code: string): boolean {
    return MEMBER_PERMISSION_CODES.has(code.trim().toLocaleUpperCase("pt-BR"));
}

/** Baseline member access is automatic; role controls manage only administrative grants. */
export function getAdministrativePermissions(permissions: PermissionResponse[]): PermissionResponse[] {
    return permissions.filter((permission) => !isMemberPermission(permission.code));
}

export function getPermissionNameByCode(code: string): string | undefined {
    const normalizedCode = code.trim().toLocaleUpperCase("pt-BR");
    return PERMISSION_NAME_LABELS[normalizedCode];
}

export function getPermissionName(permission: PermissionResponse): string {
    const normalizedPermissionCode = permission.code.trim().toLocaleUpperCase("pt-BR");
    const knownName = PERMISSION_NAME_LABELS[normalizedPermissionCode];
    if (knownName) return knownName;

    const normalizedCode = permission.code.trim().toLocaleUpperCase("pt-BR");
    const modulePrefix = `${permission.module.trim().toLocaleUpperCase("pt-BR")}_`;
    const moduleCode = normalizedCode.startsWith(modulePrefix)
        ? normalizedCode.slice(modulePrefix.length)
        : normalizedCode;
    const action = Object.keys(PERMISSION_ACTION_LABELS)
        .sort((left, right) => right.length - left.length)
        .find((candidate) => moduleCode.endsWith(`_${candidate}`) || moduleCode === candidate);
    const resourceCode = action
        ? moduleCode.replace(new RegExp(`_${action}$`), "")
        : moduleCode;
    const resource = PERMISSION_RESOURCE_LABELS[resourceCode]
        ?? getModuleLabel(permission.module).toLocaleLowerCase("pt-BR");

    const name = action
        ? `${PERMISSION_ACTION_LABELS[action]} ${resource}`
        : `Permissão de ${resource}`;
    return name;
}

export function getPermissionDescription(
    permission: PermissionResponse,
): string {
    const description = permission.description.trim().replace(/\s+/g, " ");
    const normalizedDescription =
        description.toLocaleLowerCase("en-US");

    const translated = Object.entries(ENGLISH_DESCRIPTION_LABELS).find(
        ([english]) =>
            english.toLocaleLowerCase("en-US") === normalizedDescription,
    )?.[1];

    if (translated) return translated;

    const knownName = getPermissionNameByCode(permission.code);
    if (knownName) return knownName;

    const permissionName = getPermissionName(permission);
    return permissionName.startsWith("Permissão de ")
        ? `Permissão relacionada a ${permissionName.slice("Permissão de ".length)}.`
        : `Permite ${permissionName.toLocaleLowerCase("pt-BR")}.`;
}
