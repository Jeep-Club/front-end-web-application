const MODULE_LABELS: Record<string, string> = {
    AUTHENTICATION: "Autenticação",
    AUTHORIZATION: "Autorização",
    IDENTITY: "Usuários",
    HEALTH: "Saúde",
    MEMBERSHIP: "Associação",
    BILLING: "Cobranças",
    DEPENDENTS: "Dependentes",
    PUBLICATIONS: "Publicações",
    TOOLS: "Ferramentas",
    VEHICLES: "Veículos",
};

export function getModuleLabel(module: string): string {
    return (
        MODULE_LABELS[module] ??
        module
            .replaceAll("_", " ")
            .toLocaleLowerCase("pt-BR")
            .replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase("pt-BR"))
    );
}

const PERMISSION_NAME_LABELS: Record<string, string> = {
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
    AUTHENTICATION_REFRESH_TOKEN_READ: "Consultar refresh tokens",
    AUTHENTICATION_REFRESH_TOKEN_REVOKE: "Revogar refresh tokens",
    AUTHENTICATION_PASSWORD_RECOVERY_READ:
        "Consultar pedidos de recuperação de senha",
    AUTHENTICATION_PASSWORD_RECOVERY_CANCEL:
        "Cancelar pedidos de recuperação de senha",

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
    MEMBERSHIP_MEMBERSHIP_APPLICANT_BLOCK: "Bloquear CPF de solicitante",

    PUBLICATIONS_INTERACTION_LIKE: "Curtir publicações",
    PUBLICATIONS_COMMENT_CREATE: "Comentar em publicações",
    PUBLICATIONS_COMMENT_READ: "Consultar comentários",
    PUBLICATIONS_FEED_READ: "Consultar mural de publicações",
    PUBLICATIONS_PUBLICATION_READ: "Consultar publicação",

    PUBLICATIONS_EVENT_CREATE: "Criar eventos",
    PUBLICATIONS_EVENT_READ: "Consultar eventos",
    PUBLICATIONS_EVENT_READ_ADMIN: "Consultar eventos como administrador",
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
        "Consultar histórico de participação do convidado",
    PUBLICATIONS_EVENT_GUEST_ADMIN_CREATE:
        "Cadastrar convidado como administrador",
    PUBLICATIONS_EVENT_GUEST_ADMIN_READ:
        "Consultar convidados como administrador",
    PUBLICATIONS_EVENT_GUEST_APPROVE: "Aprovar solicitação de convidado",
    PUBLICATIONS_EVENT_GUEST_REJECT: "Rejeitar solicitação de convidado",

    PUBLICATIONS_EVENT_RIDE_OFFER_READ: "Consultar ofertas de carona",
    PUBLICATIONS_EVENT_RIDE_OFFER_RESPOND: "Responder a ofertas de carona",
    PUBLICATIONS_EVENT_RIDE_OFFER_SELECT: "Selecionar oferta de carona",

    PUBLICATIONS_EVENT_ADMIN_DASHBOARD_READ:
        "Consultar painel administrativo de eventos",
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

    PUBLICATIONS_SERVICE_REQUEST_REJECT:
        "Rejeitar solicitação inicial de serviço",
    PUBLICATIONS_NOTICE_CREATE: "Criar avisos",
    PUBLICATIONS_NOTICE_READ: "Consultar avisos",
    PUBLICATIONS_NOTICE_UPDATE: "Editar avisos",
    PUBLICATIONS_NOTICE_PUBLISH: "Publicar avisos",
    PUBLICATIONS_NOTICE_ARCHIVE: "Arquivar avisos",
    PUBLICATIONS_NOTICE_DELETE: "Excluir avisos com histórico",
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
    "Event: read admin": "Consultar eventos na área administrativa.",
    "Event: update": "Atualizar eventos.",
    "Event: publish": "Publicar eventos.",
    "Event: cancel": "Cancelar eventos.",
    "Event: finish": "Finalizar eventos.",
    "Event: delete": "Excluir eventos.",
    "Event: register": "Inscrever participantes em eventos.",
    "Event: registration read": "Consultar inscrições em eventos.",
    "Event: registration cancel": "Cancelar inscrições em eventos.",
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
    "Event: guest approve": "Aprovar solicitações de convidados.",
    "Event: guest reject": "Rejeitar solicitações de convidados.",
    "Event: ride offer read": "Consultar ofertas de carona.",
    "Event: ride offer respond": "Responder a ofertas de carona.",
    "Event: ride offer select": "Selecionar ofertas de carona.",
    "Event: admin dashboard read":
        "Consultar o painel administrativo de eventos.",
    "Event: health emergency read":
        "Consultar dados médicos de emergência em eventos.",
};

export function getPermissionName(permission: PermissionResponse): string {
    const code = permission.code.trim().toLocaleUpperCase("pt-BR");

    return (
        PERMISSION_NAME_LABELS[code] ??
        getPermissionDescription(permission)
    );
}

export function getPermissionDescription(
    permission: PermissionResponse,
): string {
    const description = permission.description.trim().replace(/\s+/g, " ");
    const normalizedDescription = description.toLocaleLowerCase("en-US");

    const translated = Object.entries(ENGLISH_DESCRIPTION_LABELS).find(
        ([english]) =>
            english.toLocaleLowerCase("en-US") === normalizedDescription,
    )?.[1];

    return translated ?? description;
}