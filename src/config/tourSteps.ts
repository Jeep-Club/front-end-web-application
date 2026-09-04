import type { DriveStep } from "driver.js";

function createStepHeader(title: string, svgPath: string, badge?: string): string {
    const badgeHtml = badge
        ? `<span style="margin-left:auto; background:#e0e7ff; color:#1e3a8a; font-size:9px; font-weight:800; padding:2px 6px; border-radius:4px; text-transform:uppercase; letter-spacing:0.05em;">${badge}</span>`
        : "";

    return `
        <div style="display:flex; align-items:center; gap:8px; width:100%; margin-bottom:2px;">
            <span style="display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; min-width:24px; border-radius:6px; background:#061e50; color:#fed01b;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    ${svgPath}
                </svg>
            </span>
            <span style="font-weight:800; color:#061e50; font-size:14px; letter-spacing:-0.01em;">${title}</span>
            ${badgeHtml}
        </div>
    `;
}

// Ícones Lucide como paths SVG inline
const ICONS = {
    compass: `<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>`,
    sidebar: `<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>`,
    smartphone: `<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>`,
    feed: `<path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>`,
    user: `<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
    shield: `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>`,
    checkCircle: `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`,
    logIn: `<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/>`,
    idCard: `<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>`,
    key: `<path d="m21 2-2 2m-1.5 1.5L16 7l-1.5-1.5L13 7l-1.5-1.5L10 7l-1.5-1.5L7 7l-1.5-1.5L4 7a4.24 4.24 0 0 0 6 6l1.5-1.5L13 13l1.5-1.5L16 13l1.5-1.5L19 13l1.5-1.5L22 10l-2-2z"/>`,
    helpCircle: `<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>`,
    userPlus: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>`,
    layers: `<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2 12.5"/><path d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2 17.5"/>`,
    users: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
    wallet: `<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>`,
    plus: `<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="16"/><line x1="8" x2="16" y1="12" y2="12"/>`,
    sliders: `<line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="1" x2="7" y1="14" y2="14"/><line x1="9" x2="15" y1="8" y2="8"/><line x1="17" x2="23" y1="16" y2="16"/>`,
    heartPulse: `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>`,
    car: `<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>`,
    wrench: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`,
    arrowDown: `<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>`,
    mapPin: `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>`,
};

// Tour da tela inicial (Home / Landing Page)
export function getHomeTourSteps(): DriveStep[] {
    return [
        {
            element: "#tour-home-member-btn",
            popover: {
                title: createStepHeader("Acesso ao Painel do Clube", ICONS.logIn),
                description: "Já é membro do Jeep Club Tamoios? Clique em <strong>'Sou membro'</strong> para entrar no painel exclusivo com feed, eventos e gestão administrativa.",
                side: "bottom",
                align: "start",
            },
        },
        {
            element: "#tour-home-scroll-down",
            popover: {
                title: createStepHeader("Conheça o Clube", ICONS.arrowDown),
                description: "Ainda não é membro? Role a página para baixo e descubra a história, trilhas e o impacto social do clube antes de entrar em contato.",
                side: "top",
                align: "center",
            },
        },
    ];
}

export const homeTourSteps = getHomeTourSteps();

// Tour geral do feed / layout principal
export const welcomeStep: DriveStep = {
    popover: {
        title: createStepHeader("Visão Geral da Plataforma", ICONS.compass),
        description: "Apresentamos as principais áreas de navegação e recursos do sistema Jeep Clube Tamoios.",
        side: "bottom",
        align: "center",
    },
};

export const sidebarStep: DriveStep = {
    element: "#tour-sidebar",
    popover: {
        title: createStepHeader("Navegação Principal", ICONS.sidebar),
        description: "Acesse rapidamente todas as seções e serviços disponíveis no sistema.",
        side: "right",
        align: "start",
    },
};

export const mobileMenuStep: DriveStep = {
    element: "#tour-mobile-menu-btn",
    popover: {
        title: createStepHeader("Menu de Navegação", ICONS.smartphone),
        description: "Toque para abrir a navegação lateral e acessar o feed, avisos e a gestão administrativa.",
        side: "bottom",
        align: "start",
    },
};

export const feedStep: DriveStep = {
    element: "#tour-nav-feed",
    popover: {
        title: createStepHeader("Feed de Associados", ICONS.feed),
        description: "Acompanhe comunicados oficiais, trilhas, notícias e avisos recentes do clube.",
        side: "right",
        align: "center",
    },
};

export const avatarMenuStep: DriveStep = {
    element: "#tour-avatar-container",
    popover: {
        title: createStepHeader("Gerenciar Conta", ICONS.user),
        description: "Abra o menu do perfil e clique em 'Gerenciar conta' para acessar e atualizar seus dados pessoais, veículos e ficha médica.",
        side: "bottom",
        align: "end",
    },
};

export const adminStep: DriveStep = {
    element: "#tour-admin-link",
    popover: {
        title: createStepHeader("Gestão Administrativa", ICONS.shield, "Admin"),
        description: "Acesso exclusivo da diretoria para governança e controle de cargos. Clique no link para acessar o painel agora ou avance para continuar o tour.",
        side: "right",
        align: "center",
    },
};

export const completionStep: DriveStep = {
    popover: {
        title: createStepHeader("Tour Concluído", ICONS.checkCircle),
        description: "Configuração concluída. Você pode reiniciar este guia quando desejar pelo menu do seu perfil.",
        side: "bottom",
        align: "center",
    },
};

export function getTourSteps(
    canAccessAdmin: boolean,
    isMobile: boolean = false,
    setMobileMenuOpen?: (open: boolean) => void
): DriveStep[] {
    const steps: DriveStep[] = [welcomeStep];

    if (isMobile) {
        steps.push({
            ...mobileMenuStep,
            onDeselected: () => {
                setMobileMenuOpen?.(true);
            },
        });
    } else {
        steps.push(sidebarStep);
    }

    steps.push({
        ...feedStep,
        onHighlightStarted: () => {
            if (isMobile) setMobileMenuOpen?.(true);
        },
    });

    if (canAccessAdmin) {
        steps.push({
            ...adminStep,
            onHighlightStarted: () => {
                if (isMobile) setMobileMenuOpen?.(true);
            },
        });
    }

    steps.push({
        element: "#tour-avatar-container",
        popover: {
            title: createStepHeader("Gerenciar Conta", ICONS.user),
            description: "Abra o menu e clique em 'Gerenciar conta' para acessar suas informações de perfil, veículos 4x4 e ficha médica.",
            side: "bottom",
            align: isMobile ? "center" : "end",
        },
        onHighlightStarted: () => {
            if (isMobile) setMobileMenuOpen?.(false);
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent('tour:open-avatar-menu'));
            }
        },
        onDeselected: () => {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent('tour:close-avatar-menu'));
            }
        },
    });

    steps.push({
        ...completionStep,
        onHighlightStarted: () => {
            if (isMobile) setMobileMenuOpen?.(false);
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent('tour:close-avatar-menu'));
            }
        },
    });

    return steps;
}

// Tour da tela de login
export function getLoginTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-login-card",
            popover: {
                title: createStepHeader("Autenticação Segura", ICONS.logIn),
                description: "Portal oficial de acesso para associados e diretoria do Jeep Clube Tamoios.",
                side: "bottom",
                align: "center",
            },
        },
        {
            element: "#tour-login-cpf",
            popover: {
                title: createStepHeader("Documento de Acesso", ICONS.idCard),
                description: "Informe o CPF cadastrado. A pontuação é formatada automaticamente no preenchimento.",
                side: isMobile ? "bottom" : "top",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-login-password",
            popover: {
                title: createStepHeader("Credencial de Senha", ICONS.key),
                description: "Insira sua senha de acesso. <strong>É sua primeira vez?</strong> Utilize a senha provisória enviada pelo administrador via WhatsApp e altere-a assim que possível.",
                side: isMobile ? "bottom" : "top",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-login-forgot",
            popover: {
                title: createStepHeader("Recuperação de Acesso", ICONS.helpCircle),
                description: "Solicite instruções de redefinição de senha diretamente no seu e-mail cadastrado.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
        {
            element: "#tour-login-join",
            popover: {
                title: createStepHeader("Novo Associado", ICONS.userPlus),
                description: "Consulte os requisitos de filiação e o processo de admissão ao clube.",
                side: "top",
                align: "center",
            },
        },
    ];
}

export const loginTourSteps = getLoginTourSteps(false);

// Tour da tela de perfil (/profile)
export function getProfileTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-profile-header",
            popover: {
                title: createStepHeader("Gerenciamento de Conta", ICONS.user),
                description: "Aqui você gerencia todos os seus dados cadastrais, informações de saúde, veículos 4x4 e ferramentas de apoio.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-profile-tabs",
            popover: {
                title: createStepHeader("Seções do Perfil", ICONS.layers),
                description: "Navegue entre as abas para manter seu cadastro completo e atualizado junto ao clube.",
                side: "bottom",
                align: "center",
            },
        },
        {
            element: "#tour-profile-tab-personal",
            popover: {
                title: createStepHeader("Dados Pessoais", ICONS.idCard),
                description: "Visualize e atualize suas informações civis, e-mail, telefone e endereço de correspondência.",
                side: isMobile ? "bottom" : "top",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-profile-tab-medical",
            popover: {
                title: createStepHeader("Ficha Médica de Trilha", ICONS.heartPulse, "Saúde"),
                description: "Informações essenciais de segurança para expedições: tipo sanguíneo, alergias, medicamentos e contatos de emergência.",
                side: isMobile ? "bottom" : "top",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-profile-tab-dependents",
            popover: {
                title: createStepHeader("Dependentes", ICONS.users),
                description: "Cadastre seus dependentes familiares vinculados ao plano de associação do clube.",
                side: isMobile ? "bottom" : "top",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-profile-tab-vehicles",
            popover: {
                title: createStepHeader("Veículos e Jeeps 4x4", ICONS.car),
                description: "Cadastre seus veículos off-road autorizados para participar das trilhas, passeios e eventos oficiais.",
                side: isMobile ? "bottom" : "top",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-profile-tab-tools",
            popover: {
                title: createStepHeader("Ferramentas e Resgate", ICONS.wrench),
                description: "Declare os equipamentos de resgate disponíveis no seu veículo (guincho, cintas, prancha de desatolamento).",
                side: isMobile ? "bottom" : "top",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-profile-help-btn",
            popover: {
                title: createStepHeader("Ajuda Sempre à Mão", ICONS.helpCircle),
                description: "Você pode rever este guia do perfil a qualquer momento através deste botão no topo da tela.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
    ];
}

export const profileTourSteps = getProfileTourSteps(false);

// Tour do painel administrativo (/admin)
export function getAdminPanelTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-admin-header",
            popover: {
                title: createStepHeader("Central Administrativa", ICONS.shield, "Diretoria"),
                description: "Painel de controle com acesso aos módulos de gestão autorizados para o seu perfil.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-admin-modules-grid",
            popover: {
                title: createStepHeader("Módulos de Gestão", ICONS.layers),
                description: "Grade de módulos administrativos disponíveis. Clique em 'Gerenciar' no módulo desejado para acessar.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-admin-module-users",
            popover: {
                title: createStepHeader("Gestão de Usuários", ICONS.users, "Ativo"),
                description: "Visualize, ative e desative usuários do sistema. Gerencie o acesso dos associados à plataforma.",
                side: isMobile ? "bottom" : "left",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-admin-module-roles-permissions",
            popover: {
                title: createStepHeader("Cargos e Permissões", ICONS.sliders, "Ativo"),
                description: "Módulo principal de governança: crie cargos personalizados e defina permissões granulares de acesso.",
                side: isMobile ? "bottom" : "left",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-admin-module-financial-management",
            popover: {
                title: createStepHeader("Gestão Financeira", ICONS.wallet, "Ativo"),
                description: "Acompanhe mensalidades, faturas e a saúde financeira do clube. Controle cobranças e pagamentos dos associados.",
                side: isMobile ? "bottom" : "left",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-admin-help-btn",
            popover: {
                title: createStepHeader("Ajuda Contextual", ICONS.helpCircle),
                description: "Este guia pode ser reaberto a qualquer momento através deste botão no cabeçalho.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
    ];
}

export const adminPanelTourSteps = getAdminPanelTourSteps(false);

// Tour da tela de cargos e permissões (/admin/roles-permissoes)
export function getRolesTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-roles-header",
            popover: {
                title: createStepHeader("Controle de Cargos e Acessos", ICONS.shield, "RBAC"),
                description: "Administração central de papéis e níveis de autorização do sistema.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-create-role-btn",
            popover: {
                title: createStepHeader("Cadastrar Cargo", ICONS.plus),
                description: "Defina a nomenclatura e atribua as permissões específicas para o novo perfil.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
        {
            element: "#tour-roles-table",
            popover: {
                title: createStepHeader("Cargos Cadastrados", ICONS.layers),
                description: "Relação de cargos ativos e inativos com visualização rápida das permissões vinculadas.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-role-actions",
            popover: {
                title: createStepHeader("Ações e Permissões Granulares", ICONS.sliders),
                description: "Controle pontual: atribuição de permissões por módulo, edição, ativação/desativação e exclusão.",
                side: isMobile ? "top" : "left",
                align: "center",
            },
        },
        {
            element: "#tour-roles-help-btn",
            popover: {
                title: createStepHeader("Guia da Tela", ICONS.helpCircle),
                description: "Clique neste botão sempre que precisar rever as orientações desta tela.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
    ];
}

export const rolesTourSteps = getRolesTourSteps(false);

// Tour da tela de gestão de usuários (/admin/users)
export function getUsersTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-users-header",
            popover: {
                title: createStepHeader("Gestão de Usuários", ICONS.users, "Admin"),
                description: "Painel central para visualizar e gerenciar todos os associados cadastrados no sistema.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-users-search",
            popover: {
                title: createStepHeader("Busca Inteligente", ICONS.compass),
                description: "Pesquise usuários por <strong>nome, CPF, e-mail ou telefone</strong>. Use o seletor ao lado do campo para escolher o tipo de busca e pressione <strong>Enter</strong> para filtrar.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-users-status-filter",
            popover: {
                title: createStepHeader("Filtro de Status", ICONS.sliders),
                description: "Filtre os resultados por status do usuário: <strong>Ativo</strong> ou <strong>Desativado</strong>. Ideal para localizar rapidamente contas que precisam de atenção.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-users-table",
            popover: {
                title: createStepHeader("Tabela de Usuários", ICONS.layers),
                description: "Lista completa com matrícula, nome, e-mail, CPF, telefone e status. <strong>Clique nos cabeçalhos</strong> das colunas para ordenar os resultados.",
                side: "top",
                align: "center",
            },
        },
        {
            element: "#tour-users-actions",
            popover: {
                title: createStepHeader("Ações por Usuário", ICONS.sliders),
                description: "Cada linha possui botões de ação: o <strong>ícone de olho</strong> abre os detalhes do usuário, e o <strong>ícone de energia</strong> permite ativar ou desativar a conta.",
                side: isMobile ? "top" : "left",
                align: "center",
            },
        },
        {
            element: "#tour-users-pagination",
            popover: {
                title: createStepHeader("Paginação", ICONS.layers),
                description: "Navegue entre as páginas de resultados e ajuste a quantidade de usuários exibidos por página.",
                side: "top",
                align: "center",
            },
        },
        {
            element: "#tour-users-help-btn",
            popover: {
                title: createStepHeader("Ajuda Sempre à Mão", ICONS.helpCircle),
                description: "Você pode rever este guia a qualquer momento clicando neste botão.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
    ];
}

export const usersTourSteps = getUsersTourSteps(false);

// Tour da tela de gestão financeira (/admin/gestao-financeira)
export function getFinancialManagementTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-finance-header",
            popover: {
                title: createStepHeader("Gestão Financeira", ICONS.wallet, "Admin"),
                description: "Painel para gerenciar as receitas e modelos de cobrança do clube, como anuidades, taxas de passeios e mensalidades.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-finance-create-btn",
            popover: {
                title: createStepHeader("Criar Definição", ICONS.plus),
                description: "Clique para configurar um novo modelo de cobrança. Você define valores base, periodicidade e regras antes de atribuir aos membros.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-finance-table",
            popover: {
                title: createStepHeader("Modelos de Cobrança", ICONS.layers),
                description: "Tabela com todas as definições cadastradas. Acompanhe nome, valor padrão, tipo de recorrência, se é obrigatória e o status atual. Clique nos títulos para ordenar.",
                side: "top",
                align: "center",
            },
        },
        {
            element: "#tour-finance-actions",
            popover: {
                title: createStepHeader("Ações por Cobrança", ICONS.sliders),
                description: "Cada linha possui 4 ações: 👥 <strong>Atribuições</strong> (ver ou vincular quais membros pagam essa cobrança), ⚡ <strong>Ativar/Desativar</strong>, ✏️ <strong>Editar</strong> e 📦 <strong>Arquivar</strong>.",
                side: isMobile ? "top" : "left",
                align: "center",
            },
        },
        {
            element: "#tour-finance-pagination",
            popover: {
                title: createStepHeader("Paginação", ICONS.layers),
                description: "Navegue entre as páginas de cobranças e ajuste a quantidade de itens exibidos simultaneamente.",
                side: "top",
                align: "center",
            },
        },
        {
            element: "#tour-finance-help-btn",
            popover: {
                title: createStepHeader("Ajuda Sempre à Mão", ICONS.helpCircle),
                description: "Dúvidas sobre o funcionamento da tela financeira? Clique aqui a qualquer momento para rever este guia.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
    ];
}

export const financialManagementTourSteps = getFinancialManagementTourSteps(false);

// Tour do modal Criar Definição de Cobrança
export function getCreateChargeDefinitionTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-charge-modal-header",
            popover: {
                title: createStepHeader("Nova Definição de Cobrança", ICONS.wallet, "Modelo"),
                description: "Aqui você cria a <strong>regra matriz</strong> de uma cobrança. A definição padroniza valor, recorrência e políticas para posterior atribuição aos associados.",
                side: "bottom",
                align: "center",
            },
        },
        {
            element: "#tour-charge-field-name-desc",
            popover: {
                title: createStepHeader("Nome e Descrição", ICONS.layers),
                description: "Informe um <strong>Nome claro</strong> (ex.: Anuidade 2026, Taxa de Adesão) e uma <strong>Descrição</strong> detalhando a finalidade da cobrança para os associados.",
                side: "bottom",
                align: "center",
            },
        },
        {
            element: "#tour-charge-field-amount-recurrence",
            popover: {
                title: createStepHeader("Valor e Recorrência", ICONS.sliders),
                description: "Defina o <strong>Valor padrão</strong> e a <strong>Frequência</strong>: <em>Única</em> (eventos ou taxas pontuais), <em>Mensal</em> (mensalidades) ou <em>Anual</em> (anuidades).",
                side: "bottom",
                align: "center",
            },
        },
        {
            element: "#tour-charge-field-policy",
            popover: {
                title: createStepHeader("Política de Vencimento", ICONS.checkCircle),
                description: "Estabeleça a regra de aceite: se pode pagar apenas até o vencimento, após o vencimento ou com <strong>dias de tolerância</strong> específicos.",
                side: "bottom",
                align: "center",
            },
        },
        {
            element: "#tour-charge-field-required",
            popover: {
                title: createStepHeader("Cobrança Obrigatória", ICONS.users),
                description: "Se marcada como <strong>Obrigatória</strong>, ela é exigida de todos os membros do clube. Se desmarcada, funciona como taxa opcional/por adesão individual.",
                side: "top",
                align: "center",
            },
        },
        {
            element: "#tour-charge-btn-submit",
            popover: {
                title: createStepHeader("Concluir e Salvar", ICONS.checkCircle),
                description: "Após salvar, a cobrança estará disponível na listagem para você gerenciar ou atribuir aos associados pelo botão de atribuições 👥.",
                side: "top",
                align: "center",
            },
        },
    ];
}

export const createChargeDefinitionTourSteps = getCreateChargeDefinitionTourSteps(false);
